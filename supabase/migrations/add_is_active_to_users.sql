-- 添加is_active字段到users表
ALTER TABLE users ADD COLUMN is_active BOOLEAN DEFAULT true;

-- 为现有用户设置默认值
UPDATE users SET is_active = true WHERE is_active IS NULL;

-- 添加注释
COMMENT ON COLUMN users.is_active IS '用户状态：true为启用，false为禁用';