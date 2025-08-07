-- 创建缺失的表

-- 订单图片表
CREATE TABLE IF NOT EXISTS order_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    image_type VARCHAR(20) DEFAULT 'problem' CHECK (image_type IN ('problem', 'repair', 'before', 'after')),
    description TEXT DEFAULT '',
    uploaded_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 订单日志表
CREATE TABLE IF NOT EXISTS order_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id),
    action VARCHAR(50) NOT NULL,
    description TEXT,
    old_status VARCHAR(20),
    new_status VARCHAR(20),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 用户反馈表
CREATE TABLE IF NOT EXISTS feedbacks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    feedback_type VARCHAR(20) DEFAULT 'service' CHECK (feedback_type IN ('service', 'product', 'system', 'other')),
    is_anonymous BOOLEAN DEFAULT FALSE,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved')),
    admin_reply TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 用户地址表
CREATE TABLE IF NOT EXISTS user_addresses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    province VARCHAR(50) NOT NULL,
    city VARCHAR(50) NOT NULL,
    district VARCHAR(50) NOT NULL,
    address TEXT NOT NULL,
    postal_code VARCHAR(10),
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_order_images_order_id ON order_images(order_id);
CREATE INDEX IF NOT EXISTS idx_order_images_type ON order_images(image_type);
CREATE INDEX IF NOT EXISTS idx_order_logs_order_id ON order_logs(order_id);
CREATE INDEX IF NOT EXISTS idx_order_logs_created_at ON order_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_feedbacks_order_id ON feedbacks(order_id);
CREATE INDEX IF NOT EXISTS idx_feedbacks_user_id ON feedbacks(user_id);
CREATE INDEX IF NOT EXISTS idx_feedbacks_rating ON feedbacks(rating);
CREATE INDEX IF NOT EXISTS idx_user_addresses_user_id ON user_addresses(user_id);
CREATE INDEX IF NOT EXISTS idx_user_addresses_default ON user_addresses(is_default) WHERE is_default = TRUE;

-- 启用行级安全策略
ALTER TABLE order_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedbacks ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_addresses ENABLE ROW LEVEL SECURITY;

-- 为新表创建RLS策略
-- order_images 策略
CREATE POLICY "Users can view order images for their orders" ON order_images
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM orders 
            WHERE orders.id = order_images.order_id 
            AND (orders.user_id = auth.uid() OR orders.assigned_to = auth.uid())
        )
    );

CREATE POLICY "Users can insert order images for their orders" ON order_images
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM orders 
            WHERE orders.id = order_images.order_id 
            AND (orders.user_id = auth.uid() OR orders.assigned_to = auth.uid())
        )
    );

-- order_logs 策略
CREATE POLICY "Users can view order logs for their orders" ON order_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM orders 
            WHERE orders.id = order_logs.order_id 
            AND (orders.user_id = auth.uid() OR orders.assigned_to = auth.uid())
        )
    );

CREATE POLICY "System can insert order logs" ON order_logs
    FOR INSERT WITH CHECK (true);

-- feedbacks 策略
CREATE POLICY "Users can view their own feedbacks" ON feedbacks
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own feedbacks" ON feedbacks
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own feedbacks" ON feedbacks
    FOR UPDATE USING (user_id = auth.uid());

-- user_addresses 策略
CREATE POLICY "Users can manage their own addresses" ON user_addresses
    FOR ALL USING (user_id = auth.uid());

-- 为现有表和新表授予权限
GRANT SELECT ON users TO anon, authenticated;
GRANT ALL PRIVILEGES ON users TO authenticated;

GRANT SELECT ON orders TO anon, authenticated;
GRANT ALL PRIVILEGES ON orders TO authenticated;

GRANT SELECT ON service_types TO anon, authenticated;
GRANT ALL PRIVILEGES ON service_types TO authenticated;

GRANT SELECT ON device_types TO anon, authenticated;
GRANT ALL PRIVILEGES ON device_types TO authenticated;

GRANT SELECT ON pricing_strategies TO anon, authenticated;
GRANT ALL PRIVILEGES ON pricing_strategies TO authenticated;

GRANT SELECT ON system_configs TO anon, authenticated;
GRANT ALL PRIVILEGES ON system_configs TO authenticated;

GRANT SELECT ON order_images TO anon, authenticated;
GRANT ALL PRIVILEGES ON order_images TO authenticated;

GRANT SELECT ON order_logs TO anon, authenticated;
GRANT ALL PRIVILEGES ON order_logs TO authenticated;

GRANT SELECT ON feedbacks TO anon, authenticated;
GRANT ALL PRIVILEGES ON feedbacks TO authenticated;

GRANT SELECT ON user_addresses TO anon, authenticated;
GRANT ALL PRIVILEGES ON user_addresses TO authenticated;

-- 插入一些初始数据

-- 插入设备类型数据
INSERT INTO device_types (name, code, category, brands, description, common_issues) VALUES
('笔记本电脑', 'laptop', '电脑', 'Dell,HP,Lenovo,ASUS,Acer,Apple', '各品牌笔记本电脑维修', '屏幕破损,键盘故障,电池老化,系统崩溃,散热问题'),
('台式电脑', 'desktop', '电脑', 'Dell,HP,Lenovo,ASUS,自组装', '台式机组装与维修', '开机故障,蓝屏,硬件升级,系统重装,清灰保养'),
('手机', 'phone', '移动设备', 'iPhone,Samsung,Huawei,Xiaomi,OPPO,VIVO', '智能手机维修', '屏幕碎裂,电池续航差,充电故障,系统卡顿,进水维修'),
('平板电脑', 'tablet', '移动设备', 'iPad,Samsung,Huawei,Xiaomi', '平板电脑维修服务', '屏幕破损,充电接口故障,系统问题,电池老化'),
('打印机', 'printer', '办公设备', 'HP,Canon,Epson,Brother', '打印机维修保养', '卡纸,打印质量差,无法连接,墨盒问题')
ON CONFLICT (code) DO NOTHING;

-- 插入服务类型数据
INSERT INTO service_types (name, code, description, base_price, estimated_duration, category, required_skills) VALUES
('屏幕更换', 'screen_replacement', '更换破损的设备屏幕', 200.00, 60, 'repair', ARRAY['硬件维修', '精密操作']),
('电池更换', 'battery_replacement', '更换老化的设备电池', 150.00, 30, 'repair', ARRAY['硬件维修']),
('系统重装', 'system_reinstall', '重新安装操作系统', 80.00, 120, 'installation', ARRAY['系统安装', '数据备份']),
('硬件清洁', 'hardware_cleaning', '设备内部清洁保养', 50.00, 45, 'maintenance', ARRAY['清洁保养']),
('数据恢复', 'data_recovery', '恢复丢失或损坏的数据', 300.00, 180, 'repair', ARRAY['数据恢复', '硬件诊断']),
('软件安装', 'software_install', '安装和配置软件', 30.00, 30, 'installation', ARRAY['软件配置']),
('病毒清除', 'virus_removal', '清除病毒和恶意软件', 100.00, 90, 'repair', ARRAY['系统安全', '软件诊断']),
('硬件升级', 'hardware_upgrade', '升级设备硬件配置', 100.00, 90, 'installation', ARRAY['硬件安装', '兼容性测试'])
ON CONFLICT (code) DO NOTHING;

-- 插入系统配置数据
INSERT INTO system_configs (key, value, type, category, description) VALUES
('business_hours', '{"start": "09:00", "end": "18:00", "days": [1,2,3,4,5,6]}', 'object', 'business', '营业时间配置'),
('contact_phone', '"400-123-4567"', 'string', 'business', '客服联系电话'),
('contact_address', '"北京市朝阳区XXX街道XXX号"', 'string', 'business', '门店地址'),
('emergency_fee_rate', '1.5', 'number', 'business', '紧急服务费率倍数'),
('max_order_images', '10', 'number', 'system', '订单最大图片数量'),
('notification_enabled', 'true', 'boolean', 'notification', '是否启用通知功能'),
('sms_template_order_created', '"您的维修订单已创建，订单号：{order_id}，我们将尽快为您安排服务。"', 'string', 'notification', '订单创建短信模板'),
('sms_template_order_assigned', '"您的订单已分配给维修师傅，联系电话：{technician_phone}"', 'string', 'notification', '订单分配短信模板')
ON CONFLICT (key) DO NOTHING;