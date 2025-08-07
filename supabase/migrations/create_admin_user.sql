-- 创建管理员用户用于测试
-- 注意：这里使用明文密码仅用于测试，实际生产环境应该使用加密密码

-- 首先删除可能存在的测试管理员用户
DELETE FROM users WHERE phone = '13800138000';

-- 插入管理员用户
INSERT INTO users (phone, password, name, role) 
VALUES (
  '13800138000', 
  '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- 密码是 'password'
  '系统管理员',
  'admin'
);

-- 插入维修员用户
INSERT INTO users (phone, password, name, role) 
VALUES (
  '13800138001', 
  '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- 密码是 'password'
  '维修员张三',
  'repairman'
);

-- 插入客服用户
INSERT INTO users (phone, password, name, role) 
VALUES (
  '13800138002', 
  '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- 密码是 'password'
  '客服李四',
  'customer_service'
);

-- 查询创建的用户
SELECT id, phone, name, role, created_at 
FROM users 
WHERE phone IN ('13800138000', '13800138001', '13800138002')
ORDER BY role;