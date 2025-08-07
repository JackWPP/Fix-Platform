-- 为 device_types 和 service_types 表添加 sort_order 字段
ALTER TABLE device_types ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;
ALTER TABLE service_types ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;

-- 更新现有数据的 sort_order
UPDATE device_types SET sort_order = 1 WHERE code = 'laptop';
UPDATE device_types SET sort_order = 2 WHERE code = 'desktop';
UPDATE device_types SET sort_order = 3 WHERE code = 'phone';
UPDATE device_types SET sort_order = 4 WHERE code = 'tablet';
UPDATE device_types SET sort_order = 5 WHERE code = 'other';

UPDATE service_types SET sort_order = 1 WHERE code = 'repair';
UPDATE service_types SET sort_order = 2 WHERE code = 'maintenance';
UPDATE service_types SET sort_order = 3 WHERE code = 'installation';
UPDATE service_types SET sort_order = 4 WHERE code = 'consultation';
UPDATE service_types SET sort_order = 5 WHERE code = 'cleaning';
UPDATE service_types SET sort_order = 6 WHERE code = 'screen_replacement';
UPDATE service_types SET sort_order = 7 WHERE code = 'data_recovery';
UPDATE service_types SET sort_order = 8 WHERE code = 'virus_removal';

-- 插入基础设备类型数据（如果不存在）
INSERT INTO device_types (name, code, category, brands, description, is_active, sort_order)
VALUES 
  ('笔记本电脑', 'laptop', '电脑', '联想,戴尔,华硕,惠普,苹果', '各品牌笔记本电脑维修', true, 1),
  ('台式电脑', 'desktop', '电脑', '联想,戴尔,华硕,惠普', '台式机组装维修', true, 2),
  ('手机', 'phone', '移动设备', '苹果,华为,小米,OPPO,vivo', '智能手机维修', true, 3),
  ('平板电脑', 'tablet', '移动设备', '苹果,华为,小米,联想', '平板设备维修', true, 4),
  ('其他设备', 'other', '其他', '各品牌', '其他电子设备', true, 5)
ON CONFLICT (code) DO NOTHING;

-- 插入基础服务类型数据（如果不存在）
INSERT INTO service_types (name, code, description, base_price, estimated_duration, is_active, category, sort_order)
VALUES 
  ('设备维修', 'repair', '硬件故障维修服务', 100.00, 120, true, 'repair', 1),
  ('设备保养', 'maintenance', '定期保养维护服务', 50.00, 60, true, 'maintenance', 2),
  ('系统安装', 'installation', '操作系统安装配置', 80.00, 90, true, 'installation', 3),
  ('技术咨询', 'consultation', '技术问题咨询服务', 30.00, 30, true, 'consultation', 4),
  ('设备清灰', 'cleaning', '内部清洁除尘服务', 40.00, 45, true, 'maintenance', 5),
  ('屏幕更换', 'screen_replacement', '显示屏更换服务', 200.00, 60, true, 'repair', 6),
  ('数据恢复', 'data_recovery', '数据找回恢复服务', 150.00, 180, true, 'repair', 7),
  ('病毒清理', 'virus_removal', '系统病毒清理服务', 60.00, 90, true, 'maintenance', 8)
ON CONFLICT (code) DO NOTHING;

-- 为新表授权
GRANT SELECT ON device_types TO anon;
GRANT SELECT ON device_types TO authenticated;
GRANT SELECT ON service_types TO anon;
GRANT SELECT ON service_types TO authenticated;