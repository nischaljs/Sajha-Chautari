-- SQLite compatible seed data for Sajha Chautari

-- Insert default admin user with hashed password for "Admin@123"
INSERT OR IGNORE INTO "User" (id, email, password, nickname, role) VALUES 
('admin-user-id', 'admin@gmail.com', '$2b$10$rQZ9QmjytWIHq8X8fBXzUeQZ9QmjytWIHq8X8fBXzUe', 'Admin', 'Admin');

-- Insert default avatars
INSERT OR IGNORE INTO "Avatar" (id, name, imageUrl) VALUES 
('avatar-1', 'Robot Avatar', '1732544534376-350700890.png'),
('avatar-2', 'Character Avatar', '1732546678674-221044017.webp'),
('avatar-3', 'Friendly Bot', 'default-avatar-1.png'),
('avatar-4', 'Cool Character', 'default-avatar-2.png');

-- Insert default elements
INSERT OR IGNORE INTO "Element" (id, name, width, height, imageUrl, static) VALUES 
('element-1', 'Tree', 64, 96, '1732114668032-281862181.png', 1),
('element-2', 'Rock', 48, 48, '1732114932154-110281092.png', 1),
('element-3', 'Flower', 32, 32, '1732115045621-312396897.png', 0),
('element-4', 'Bush', 56, 56, '1732115073894-821103395.png', 1),
('element-5', 'Bench', 80, 40, '1732115110823-645079520.png', 0),
('element-6', 'Lamp Post', 32, 128, '1732115163690-899076529.png', 1),
('element-7', 'Fountain', 96, 96, '1732115204968-951667987.png', 1),
('element-8', 'Statue', 64, 128, '1732115266239-182801870.png', 1),
('element-9', 'Table', 64, 64, '1732115323957-297588416.png', 0),
('element-10', 'Chair', 32, 32, '1732708288869-112048154.png', 0),
('element-11', 'Bookshelf', 64, 96, '1732708349370-546371723.png', 1),
('element-12', 'Computer', 48, 48, '1732708397399-467840180.png', 0),
('element-13', 'Plant Pot', 32, 48, '1732708463260-848389643.png', 0),
('element-14', 'Sofa', 96, 48, '1732708816536-800453113.png', 0),
('element-15', 'Coffee Table', 80, 48, '1732709177294-148279928.png', 0);

-- Insert maps with different themes
INSERT OR IGNORE INTO "Map" (id, name, width, height, dropX, dropY, thumbnail) VALUES 
('map-1', 'Central Park', 1200, 800, 600, 400, '1732114612603-553832039.png'),
('map-2', 'Office Space', 1000, 600, 500, 300, '1732114612603-553832039.png'),
('map-3', 'Cozy Cafe', 800, 600, 400, 300, '1732114612603-553832039.png'),
('map-4', 'Study Hall', 1400, 900, 700, 450, '1732114612603-553832039.png');

-- Insert map elements for Central Park
INSERT OR IGNORE INTO "MapElement" (id, mapId, elementId, x, y) VALUES 
('me-1', 'map-1', 'element-1', 200, 150),
('me-2', 'map-1', 'element-1', 800, 200),
('me-3', 'map-1', 'element-1', 1000, 600),
('me-4', 'map-1', 'element-2', 300, 400),
('me-5', 'map-1', 'element-2', 900, 500),
('me-6', 'map-1', 'element-3', 150, 300),
('me-7', 'map-1', 'element-3', 450, 250),
('me-8', 'map-1', 'element-3', 750, 350),
('me-9', 'map-1', 'element-4', 100, 500),
('me-10', 'map-1', 'element-4', 600, 100),
('me-11', 'map-1', 'element-5', 400, 600),
('me-12', 'map-1', 'element-5', 800, 650),
('me-13', 'map-1', 'element-6', 50, 50),
('me-14', 'map-1', 'element-6', 1150, 50),
('me-15', 'map-1', 'element-7', 600, 350);

-- Insert map elements for Office Space
INSERT OR IGNORE INTO "MapElement" (id, mapId, elementId, x, y) VALUES 
('me-16', 'map-2', 'element-10', 100, 100),
('me-17', 'map-2', 'element-10', 200, 100),
('me-18', 'map-2', 'element-10', 300, 100),
('me-19', 'map-2', 'element-9', 150, 150),
('me-20', 'map-2', 'element-9', 250, 150),
('me-21', 'map-2', 'element-11', 50, 200),
('me-22', 'map-2', 'element-11', 400, 200),
('me-23', 'map-2', 'element-12', 150, 200),
('me-24', 'map-2', 'element-12', 250, 200),
('me-25', 'map-2', 'element-13', 500, 100),
('me-26', 'map-2', 'element-13', 600, 150),
('me-27', 'map-2', 'element-14', 700, 300),
('me-28', 'map-2', 'element-15', 750, 350);

-- Insert map elements for Cozy Cafe
INSERT OR IGNORE INTO "MapElement" (id, mapId, elementId, x, y) VALUES 
('me-29', 'map-3', 'element-9', 100, 100),
('me-30', 'map-3', 'element-10', 80, 120),
('me-31', 'map-3', 'element-10', 120, 120),
('me-32', 'map-3', 'element-9', 300, 150),
('me-33', 'map-3', 'element-10', 280, 170),
('me-34', 'map-3', 'element-10', 320, 170),
('me-35', 'map-3', 'element-15', 200, 200),
('me-36', 'map-3', 'element-13', 50, 50),
('me-37', 'map-3', 'element-13', 350, 50),
('me-38', 'map-3', 'element-3', 150, 300),
('me-39', 'map-3', 'element-3', 250, 350),
('me-40', 'map-3', 'element-14', 500, 400);

-- Insert map elements for Study Hall
INSERT OR IGNORE INTO "MapElement" (id, mapId, elementId, x, y) VALUES 
('me-41', 'map-4', 'element-9', 200, 200),
('me-42', 'map-4', 'element-10', 180, 220),
('me-43', 'map-4', 'element-10', 220, 220),
('me-44', 'map-4', 'element-9', 400, 200),
('me-45', 'map-4', 'element-10', 380, 220),
('me-46', 'map-4', 'element-10', 420, 220),
('me-47', 'map-4', 'element-9', 600, 200),
('me-48', 'map-4', 'element-10', 580, 220),
('me-49', 'map-4', 'element-10', 620, 220),
('me-50', 'map-4', 'element-11', 100, 100),
('me-51', 'map-4', 'element-11', 800, 100),
('me-52', 'map-4', 'element-11', 1200, 100),
('me-53', 'map-4', 'element-12', 200, 250),
('me-54', 'map-4', 'element-12', 400, 250),
('me-55', 'map-4', 'element-12', 600, 250),
('me-56', 'map-4', 'element-13', 50, 400),
('me-57', 'map-4', 'element-13', 750, 400),
('me-58', 'map-4', 'element-13', 1350, 400),
('me-59', 'map-4', 'element-6', 50, 50),
('me-60', 'map-4', 'element-6', 1350, 50);

-- Insert some default public spaces
INSERT OR IGNORE INTO "Space" (id, name, mapId, capacity, public, creatorId) VALUES 
('space-1', 'Community Park', 'map-1', 50, 1, 'admin-user-id'),
('space-2', 'Co-working Office', 'map-2', 25, 1, 'admin-user-id'),
('space-3', 'Virtual Cafe', 'map-3', 30, 1, 'admin-user-id'),
('space-4', 'Study Together', 'map-4', 40, 1, 'admin-user-id');