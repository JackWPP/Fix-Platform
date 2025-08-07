-- 添加service_details字段到orders表
ALTER TABLE orders ADD COLUMN IF NOT EXISTS service_details TEXT;

-- 添加注释
COMMENT ON COLUMN orders.service_details IS '预约服务的详细描述或特殊要求';

-- 更新RLS策略（如果需要）
-- 由于service_details是orders表的一部分，现有的RLS策略已经覆盖了这个字段

-- 确保权限正确设置
GRANT SELECT, INSERT, UPDATE ON orders TO authenticated;
GRANT SELECT ON orders TO anon;