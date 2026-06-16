// scripts/seed-admin.js
const { Client } = require('../services/auth-service/node_modules/pg');
const bcrypt = require('../services/auth-service/node_modules/bcrypt');

async function main() {
  const client = new Client({
    connectionString: 'postgresql://authuser:authpassword@localhost:5432/auth_service'
  });

  try {
    await client.connect();
    console.log('🔌 Connected to auth_service database.');

    // 1. Ensure roles exist
    const roles = [
      { name: 'admin', description: 'Administrator with full permissions' },
      { name: 'professor', description: 'Professor/Docente user' },
      { name: 'student', description: 'Student user' },
      { name: 'lab_manager', description: 'Laboratory Manager' }
    ];

    for (const role of roles) {
      const existing = await client.query('SELECT * FROM roles WHERE name = $1', [role.name]);
      if (existing.rows.length === 0) {
        await client.query(
          'INSERT INTO roles (id, name, description) VALUES (gen_random_uuid(), $1, $2)',
          [role.name, role.description]
        );
        console.log(`✅ Created role: ${role.name}`);
      }
    }

    // Get the admin role ID
    const adminRoleRes = await client.query('SELECT id FROM roles WHERE name = $1', ['admin']);
    const adminRoleId = adminRoleRes.rows[0].id;

    // 2. Check if admin user exists
    const email = 'admin@uce.edu.ec';
    const existingAdmin = await client.query('SELECT * FROM users WHERE email = $1', [email]);

    let adminUserId;
    if (existingAdmin.rows.length === 0) {
      const hashedPassword = await bcrypt.hash('Administr@dor123', 10);
      const insertRes = await client.query(
        `INSERT INTO users (id, email, "firstName", "lastName", password, "isActive", "createdAt", "updatedAt") 
         VALUES (gen_random_uuid(), $1, $2, $3, $4, true, NOW(), NOW()) RETURNING id`,
        [email, 'Juan', 'Lopez', hashedPassword]
      );
      adminUserId = insertRes.rows[0].id;
      console.log(`✅ Created admin user: ${email}`);
    } else {
      adminUserId = existingAdmin.rows[0].id;
      console.log(`ℹ️ Admin user already exists: ${email}`);
    }

    // 3. Link admin user to admin role in user_roles
    // First let's check what columns are in user_roles
    const tableColsRes = await client.query(
      `SELECT column_name FROM information_schema.columns WHERE table_name = 'user_roles'`
    );
    const cols = tableColsRes.rows.map(r => r.column_name);
    console.log('user_roles columns:', cols);

    const userCol = cols.find(c => c.toLowerCase().includes('user'));
    const roleCol = cols.find(c => c.toLowerCase().includes('role'));

    if (!userCol || !roleCol) {
      throw new Error(`Could not determine columns of user_roles table. Found: ${cols.join(', ')}`);
    }

    const checkLink = await client.query(
      `SELECT * FROM user_roles WHERE "${userCol}" = $1 AND "${roleCol}" = $2`,
      [adminUserId, adminRoleId]
    );

    if (checkLink.rows.length === 0) {
      await client.query(
        `INSERT INTO user_roles ("${userCol}", "${roleCol}") VALUES ($1, $2)`,
        [adminUserId, adminRoleId]
      );
      console.log(`✅ Linked user ${email} to admin role.`);
    } else {
      console.log(`ℹ️ User ${email} already linked to admin role.`);
    }

    console.log('🎉 Seeding successfully completed!');
  } catch (error) {
    console.error('❌ Error seeding admin user:', error);
  } finally {
    await client.end();
  }
}

main();
