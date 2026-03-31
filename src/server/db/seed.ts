import pool from './pool';
import bcrypt from 'bcryptjs';

const ADMIN_PASSWORD = 'admin123';

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

async function seed() {
  console.log('🌱 Seeding database (minimal - admin only)...');
  
  const client = await pool.connect();
  
  try {
    // Clear existing data (optional - uncomment if needed)
    // await client.query('DELETE FROM users WHERE email != $1', ['admin@hoangu.com']);

    // Insert admin user only
    const adminPasswordHash = await hashPassword(ADMIN_PASSWORD);
    await client.query(
      `INSERT INTO users (email, password_hash, full_name, role, level, xp, total_xp, xp_to_next_level, coins, language)
       VALUES ('admin@hoangu.com', $1, 'Admin', 'admin', 10, 10000, 10000, 1000, 5000, 'vi')
       ON CONFLICT (email) DO UPDATE SET role = 'admin', full_name = 'Admin'`,
      [adminPasswordHash]
    );
    console.log('✓ Admin user: admin@hoangu.com / admin123');

    // Insert default settings
    await client.query(
      `INSERT INTO settings (key, value) VALUES 
       ('bank_name', 'Vietcombank'),
       ('account_number', '1234567890'),
       ('account_name', 'CONG TY TNHH HOANGU'),
       ('bank_branch', 'Chi nhánh TP.HCM'),
       ('momo_phone', '0901234567'),
       ('site_name', 'HoaNgữ LMS'),
       ('site_description', 'Học tiếng Hoa online')
       ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`
    );
    console.log('✓ Settings');

    console.log('\n✅ Seeding completed! (Admin user created)');
    console.log('\n📌 Admin can now:');
    console.log('   1. Create users (students, instructors)');
    console.log('   2. Approve courses');
    console.log('   3. Create banners, notifications');
    console.log('   4. Manage all content');
  } catch (error) {
    console.error('❌ Seeding error:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

seed();
