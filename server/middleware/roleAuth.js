// 角色权限验证中间件
const roleAuth = (allowedRoles) => {
  return (req, res, next) => {
    try {
      // 检查用户是否已认证
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: '请先登录'
        });
      }
      
      // 检查用户角色是否有权限
      if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: '权限不足，无法访问此资源'
        });
      }
      
      next();
    } catch (error) {
      res.status(500).json({
        success: false,
        message: '权限验证失败'
      });
    }
  };
};

module.exports = roleAuth;