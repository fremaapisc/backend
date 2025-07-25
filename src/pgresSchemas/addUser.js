// Insert a new user
const pool = require("./db"); // Import the pool from db.js

const addUser = async (user) => {
  const { name, email, password, profileImage } = user;
  const query = `
    INSERT INTO users (name, email, password, profile_image, created_at, updated_at)
    VALUES ($1, $2, $3, $4, NOW(), NOW()) RETURNING *;
  `;

  try {
    const result = await pool.query(query, [
      name,
      email,
      password,
      profileImage,
    ]);
    console.log("User added:", result.rows[0]);
  } catch (error) {
    console.error("Error adding user:", error);
  }
};

// Example usage
addUser({
  name: "John Doe",
  email: "john.doe@example.com",
  password: "securepassword",
  profileImage: "",
});
