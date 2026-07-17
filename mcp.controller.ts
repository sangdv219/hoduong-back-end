import { Controller, Get, Post, Req, Res, Query, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import { UserService } from '@/modules/users/services/user.service';

@Controller('mcp') // Đồng bộ prefix route để tránh lỗi lệch cấu hình
export class McpController {
  private mcpServer: Server;
  private activeTransports = new Map<string, SSEServerTransport>();
  // Lưu giữ transport hiện tại đang kết nối với Server
  private currentConnectedTransport: SSEServerTransport | null = null;

  constructor(private readonly usersService: UserService) {
    this.mcpServer = new Server(
      { name: 'nestjs-postgres-mcp', version: '1.0.0' },
      { capabilities: { tools: {} } }
    );
    this.registerMcpTools();
  }

  private registerMcpTools() {
    this.mcpServer.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'get_user_db_detail',
            description: 'Truy vấn trực tiếp từ Postgres để lấy thông tin chi tiết của một user theo ID.',
            inputSchema: {
              type: 'object',
              properties: {
                userId: { type: 'string', description: 'UUID hoặc ID định danh của user trong cơ sở dữ liệu' },
              },
              required: ['userId'],
            },
          },
        ],
      };
    });

    this.mcpServer.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;
      try {
        // Tác vụ 1: Lấy chi tiết User từ Postgres
        if (name === 'get_user_db_detail') {
          const parsedArgs = z.object({ userId: z.string() }).parse(args);
          
          // Gọi Service tương tác Repository/Model truy vấn database thật
          const user = await this.usersService.getById(parsedArgs.userId);
          
          if (!user) {
            return { content: [{ type: 'text', text: `Không tìm thấy user với ID ${parsedArgs.userId} trong Postgres.` }] };
          }

          // Bảo mật đa ngữ cảnh: Loại bỏ password/credential trước khi trả dữ liệu cho AI
          const { password, salt, ...safeUserData } = user;

          return {
            content: [{ type: 'text', text: JSON.stringify(safeUserData) }],
          };
        }

        // Tác vụ 2: Thống kê số lượng theo vai trò
        // if (name === 'count_users_by_role') {
        //   const parsedArgs = z.object({ role: z.string() }).parse(args);
          
        //   // Giả định hàm thống kê từ Postgres: SELECT COUNT(*) FROM users WHERE role = x
        //   const count = await this.usersService.countByRole(parsedArgs.role);

        //   return {
        //     content: [{ 
        //       type: 'text', 
        //       text: JSON.stringify({ role: parsedArgs.role, totalCount: count, timestamp: new Date() }) 
        //     }],
        //   };
        // }

        throw new Error(`Công cụ không tồn tại: ${name}`);
      } catch (error) {
        console.error(`[MCP Tool Error - ${name}]:`, error);
        return {
          isError: true,
          content: [{ type: 'text', text: `Lỗi thực thi dữ liệu hệ thống: ${error.message}` }],
        };
      }
    });
  }

  // Endpoint thiết lập kết nối luồng SSE (GET)
  @Get('sse')
  async handleSse(@Req() req: Request, @Res() res: Response) {
    // 1. Nếu hệ thống đang có một kết nối cũ được liên kết ngầm, hãy đóng nó trước để giải phóng Server
    if (this.currentConnectedTransport) {
      try {
        await this.currentConnectedTransport.close();
      } catch (e) {
        // Bỏ qua lỗi đóng nếu kết nối cũ đã tự sập trước đó
      }
      this.currentConnectedTransport = null;
    }

    // 2. Khởi tạo transport mới tươi nguyên cho phiên làm việc mới
    const transport = new SSEServerTransport('/api/mcp/messages', res);
    const sessionId = transport.sessionId;
    
    this.activeTransports.set(sessionId, transport);
    this.currentConnectedTransport = transport;

    req.on('close', () => {
      this.activeTransports.delete(sessionId);
      if (this.currentConnectedTransport === transport) {
        this.currentConnectedTransport = null;
      }
    });

    try {
      // Tiến hành kết nối một cách an toàn mà không sợ lỗi chồng lặp kết nối
      await this.mcpServer.connect(transport);
      console.log(`[MCP] Connect success for session: ${sessionId}`);
    } catch (error) {
      console.error('[MCP] Connect fail:', error);
    }
  }

  // Endpoint tiếp nhận lệnh gửi ngược từ Client lên Server (POST)
  @Post('messages')
  async handleMessages(
    @Req() req: Request, 
    @Res() res: Response, 
    @Query('sessionId') sessionId: string
  ) {
    const transport = this.activeTransports.get(sessionId);
    
    if (!transport) {
      return res.status(HttpStatus.BAD_REQUEST).send('Session không hợp lệ hoặc đã hết hạn.');
    }

    try {
      // FIX TRIỆT ĐỂ LỖI STREAM: Truyền req.body (dữ liệu đã được NestJS parse sẵn) vào tham số thứ 3
      // Tuyệt đối KHÔNG gọi res.status().end() trước dòng này để tránh đóng luồng sớm.
      await transport.handlePostMessage(req, res, req.body); 
    } catch (error) {
      console.error('[MCP] Error in handleMessages:', error);
      if (!res.headersSent) {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).end();
      }
    }
  }
}