"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const auth_service_1 = require("./auth.service");
const captcha_service_1 = require("./captcha.service");
const login_dto_1 = require("./dto/login.dto");
const register_dto_1 = require("./dto/register.dto");
const reset_password_dto_1 = require("./dto/reset-password.dto");
const wechat_dto_1 = require("./dto/wechat.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
let AuthController = class AuthController {
    constructor(authService, captchaService) {
        this.authService = authService;
        this.captchaService = captchaService;
    }
    getCaptcha(req) {
        const ip = req.ip || req.socket.remoteAddress;
        return this.captchaService.generate(ip);
    }
    async register(registerDto) {
        return this.authService.register(registerDto);
    }
    async login(loginDto, req) {
        return this.authService.login(loginDto, { ip: req.ip || req.socket.remoteAddress });
    }
    async wechatMpLogin(dto, req) {
        return this.authService.wechatMpLogin(dto, { ip: req.ip || req.socket.remoteAddress });
    }
    async wechatAppLogin(dto, req) {
        return this.authService.wechatAppLogin(dto, { ip: req.ip || req.socket.remoteAddress });
    }
    async bindPhone(userId, dto, req) {
        return this.authService.bindPhone(userId, dto, { ip: req.ip || req.socket.remoteAddress });
    }
    async bindWechatMp(userId, dto, req) {
        return this.authService.bindWechatMp(userId, dto, { ip: req.ip || req.socket.remoteAddress });
    }
    async bindWechatApp(userId, dto, req) {
        return this.authService.bindWechatApp(userId, dto, { ip: req.ip || req.socket.remoteAddress });
    }
    async unbindWechat(userId, body, req) {
        const platform = body?.platform === 'APP' ? 'APP' : 'MP';
        return this.authService.unbindWechat(userId, platform, { ip: req.ip || req.socket.remoteAddress });
    }
    async forgotPassword(body) {
        return this.authService.forgotPassword(body.phone, body.captchaId, body.captchaAnswer);
    }
    async resetPassword(resetPasswordDto) {
        return this.authService.resetPassword(resetPasswordDto);
    }
    async refreshTokens(userId, phone) {
        return this.authService.refreshTokens(userId, phone);
    }
    async getProfile(user) {
        return user;
    }
    async changePassword(userId, body) {
        return this.authService.changePassword(userId, body.oldPassword, body.newPassword);
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, common_1.Get)('captcha'),
    (0, swagger_1.ApiOperation)({ summary: '获取图片验证码', description: '生成 SVG 格式的图片验证码' }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "getCaptcha", null);
__decorate([
    (0, common_1.Post)('register'),
    (0, swagger_1.ApiOperation)({ summary: '用户注册', description: '使用手机号、密码和图片验证码注册新账号' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [register_dto_1.RegisterDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "register", null);
__decorate([
    (0, common_1.Post)('login'),
    (0, swagger_1.ApiOperation)({
        summary: '用户登录',
        description: '使用手机号和密码登录；小程序端可附带 wechatCode 触发自动绑定微信',
    }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [login_dto_1.LoginDto, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "login", null);
__decorate([
    (0, common_1.Post)('wechat/mp-login'),
    (0, swagger_1.ApiOperation)({
        summary: '小程序微信登录',
        description: '使用 wx.login() 返回的 code 进行登录，未注册时自动建号',
    }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [wechat_dto_1.WechatMpLoginDto, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "wechatMpLogin", null);
__decorate([
    (0, common_1.Post)('wechat/app-login'),
    (0, swagger_1.ApiOperation)({
        summary: 'App 微信登录',
        description: '使用微信 OpenSDK 授权回调的 code 进行登录，未注册时自动建号',
    }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [wechat_dto_1.WechatAppLoginDto, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "wechatAppLogin", null);
__decorate([
    (0, common_1.Post)('bind/phone'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: '绑定手机号', description: '为已登录账号补充手机号和密码' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('sub')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, wechat_dto_1.BindPhoneDto, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "bindPhone", null);
__decorate([
    (0, common_1.Post)('bind/wechat-mp'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: '绑定小程序微信', description: '为已登录账号绑定当前小程序微信' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('sub')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, wechat_dto_1.BindWechatMpDto, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "bindWechatMp", null);
__decorate([
    (0, common_1.Post)('bind/wechat-app'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: '绑定 App 微信', description: '为已登录账号绑定当前移动应用微信' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('sub')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, wechat_dto_1.BindWechatAppDto, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "bindWechatApp", null);
__decorate([
    (0, common_1.Post)('unbind/wechat'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: '解绑微信', description: '解绑指定平台的微信账号（要求已绑手机号 + 密码）' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('sub')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "unbindWechat", null);
__decorate([
    (0, common_1.Post)('forgot-password'),
    (0, swagger_1.ApiOperation)({ summary: '忘记密码', description: '验证手机号和图片验证码，获取密码重置令牌' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "forgotPassword", null);
__decorate([
    (0, common_1.Post)('reset-password'),
    (0, swagger_1.ApiOperation)({ summary: '重置密码', description: '使用重置令牌设置新密码' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [reset_password_dto_1.ResetPasswordDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "resetPassword", null);
__decorate([
    (0, common_1.Post)('refresh'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: '刷新 Token', description: '使用刷新令牌获取新的访问令牌' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('sub')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('phone')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "refreshTokens", null);
__decorate([
    (0, common_1.Get)('profile'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: '获取用户信息', description: '获取当前登录用户的信息' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "getProfile", null);
__decorate([
    (0, common_1.Post)('change-password'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: '修改密码', description: '验证旧密码后设置新密码' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('sub')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "changePassword", null);
exports.AuthController = AuthController = __decorate([
    (0, swagger_1.ApiTags)('认证'),
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [auth_service_1.AuthService,
        captcha_service_1.CaptchaService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map