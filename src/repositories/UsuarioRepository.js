const pool = require('../config/database');

class UsuarioRepository {
    async create(usuarioData) {
        const { nome, email, senha, papel } = usuarioData;
        const [result] = await pool.query(
            'INSERT INTO usuario (nome, email, senha, papel) VALUES (?, ?, ?, ?)',
            [nome, email, senha, papel || 'cliente']
        );
        return result.insertId;
    }

    async findById(id) {
        const [rows] = await pool.query('SELECT * FROM usuario WHERE id = ?', [id]);
        return rows[0];
    }

    async update(id, usuarioData) {
        const fields = [];
        const values = [];
        for (const [key, value] of Object.entries(usuarioData)) {
            fields.push(`${key} = ?`);
            values.push(value);
        }
        if (fields.length === 0) return null;

        values.push(id);
        const query = `UPDATE usuario SET ${fields.join(', ')} WHERE id = ?`;
        const [result] = await pool.query(query, values);
        return result.affectedRows;
    }

    async delete(id) {
        const [result] = await pool.query('DELETE FROM usuario WHERE id = ?', [id]);
        return result.affectedRows;
    }
}

module.exports = new UsuarioRepository();
