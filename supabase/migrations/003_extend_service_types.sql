-- 扩展维修服务类型：添加维修服务和预约服务支持
-- 为订单表添加服务类型和相关字段

-- 添加服务类型枚举
CREATE TYPE service_type AS ENUM ('repair', 'appointment');

-- 添加预约服务项目枚举
CREATE TYPE appointment_service AS ENUM ('cleaning', 'screen_replacement', 'battery_replacement', 'system_reinstall', 'software_install');

-- 为订单表添加新字段
ALTER TABLE orders 
ADD COLUMN service_type service_type DEFAULT 'repair',
ADD COLUMN appointment_service appointment_service,
ADD COLUMN has_liquid_metal BOOLEAN,
ADD COLUMN liquid_metal_confirmed BOOLEAN,
ADD COLUMN service_details JSONB DEFAULT '{}'::jsonb;

-- 添加注释
COMMENT ON COLUMN orders.service_type IS '服务类型：repair=维修服务，appointment=预约服务';
COMMENT ON COLUMN orders.appointment_service IS '预约服务项目：cleaning=清灰，screen_replacement=换屏，battery_replacement=换电池，system_reinstall=系统重装，software_install=软件安装';
COMMENT ON COLUMN orders.has_liquid_metal IS '是否为液态金属机型（仅清灰服务）';
COMMENT ON COLUMN orders.liquid_metal_confirmed IS '液态金属机型确认状态：true=是，false=否，null=不确定';
COMMENT ON COLUMN orders.service_details IS '服务详细信息JSON格式存储';

-- 创建索引
CREATE INDEX idx_orders_service_type ON orders(service_type);
CREATE INDEX idx_orders_appointment_service ON orders(appointment_service);

-- 更新现有订单为维修服务类型
UPDATE orders SET service_type = 'repair' WHERE service_type IS NULL;

-- 添加约束：预约服务必须指定服务项目
ALTER TABLE orders ADD CONSTRAINT check_appointment_service 
  CHECK (
    (service_type = 'repair') OR 
    (service_type = 'appointment' AND appointment_service IS NOT NULL)
  );

-- 添加约束：液态金属相关字段仅在清灰服务时使用
ALTER TABLE orders ADD CONSTRAINT check_liquid_metal_cleaning_only 
  CHECK (
    (appointment_service != 'cleaning') OR 
    (appointment_service = 'cleaning' AND has_liquid_metal IS NOT NULL)
  );

-- 创建服务类型配置表
CREATE TABLE service_configs (
  id SERIAL PRIMARY KEY,
  service_type service_type NOT NULL,
  appointment_service appointment_service,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  base_price DECIMAL(10,2),
  estimated_duration INTEGER, -- 预估时长（分钟）
  requires_device_info BOOLEAN DEFAULT false,
  requires_liquid_metal_check BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 添加注释
COMMENT ON TABLE service_configs IS '服务类型配置表';
COMMENT ON COLUMN service_configs.estimated_duration IS '预估服务时长（分钟）';
COMMENT ON COLUMN service_configs.requires_device_info IS '是否需要设备信息';
COMMENT ON COLUMN service_configs.requires_liquid_metal_check IS '是否需要液态金属检查';

-- 插入服务配置数据
INSERT INTO service_configs (service_type, appointment_service, name, description, base_price, estimated_duration, requires_device_info, requires_liquid_metal_check) VALUES
-- 维修服务
('repair', NULL, '故障维修', '设备故障诊断和维修服务', 0.00, 60, true, false),

-- 预约服务
('appointment', 'cleaning', '设备清灰', '清理设备内部灰尘，提升散热性能', 50.00, 30, true, true),
('appointment', 'screen_replacement', '屏幕更换', '更换损坏的设备屏幕', 200.00, 45, true, false),
('appointment', 'battery_replacement', '电池更换', '更换老化或损坏的电池', 150.00, 30, true, false),
('appointment', 'system_reinstall', '系统重装', '重新安装操作系统', 80.00, 90, true, false),
('appointment', 'software_install', '软件安装', '安装必要的软件和驱动程序', 30.00, 20, false, false);

-- 创建索引
CREATE INDEX idx_service_configs_type ON service_configs(service_type);
CREATE INDEX idx_service_configs_appointment ON service_configs(appointment_service);
CREATE INDEX idx_service_configs_active ON service_configs(is_active);

-- 为service_configs表启用RLS
ALTER TABLE service_configs ENABLE ROW LEVEL SECURITY;

-- 创建RLS策略
CREATE POLICY "service_configs_select_policy" ON service_configs
  FOR SELECT USING (true);

CREATE POLICY "service_configs_insert_policy" ON service_configs
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "service_configs_update_policy" ON service_configs
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "service_configs_delete_policy" ON service_configs
  FOR DELETE USING (auth.role() = 'authenticated');

-- 授予权限
GRANT SELECT ON service_configs TO anon;
GRANT ALL PRIVILEGES ON service_configs TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE service_configs_id_seq TO authenticated;

-- 更新orders表的RLS策略以包含新字段
-- 注意：这里不需要修改现有策略，新字段会自动包含在现有的SELECT/INSERT/UPDATE策略中