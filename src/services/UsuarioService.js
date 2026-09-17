const UsuarioRepository = require('../repositories/UsuarioRepository');
const fs = require('fs').promises;
const path = require('path');

class UsuarioService {
    async listarUsuarios() {
        const usuarios = await UsuarioRepository.findAll();
        const usuariosFormatados = usuarios.map(p => ({
            ...p,
            imagem: p.imagem ? `/public/${p.imagem}` : null
        }));
        return {
            sucesso: true,
            dados: usuariosFormatados,
            total: usuariosFormatados.length
        };
    }
    
    async buscarUsuarioPorId(id) {
        if (!id || isNaN(id)) {
            throw { status: 400, mensagem: "ID inválido" };
        }

        const usuario = await ProdutoRepository.findById(id);
        if (!usuario) {
            throw { status: 404, mensagem: "Usuário não encontrado" };
        }

        return {
            sucesso: true,
            dados: {
                ...usuario,
                imagem: usuario.imagem ? `/public/${produto.imagem}` : null
            }
        };
    }

    async cadastrarUsuario(dados) {
        let { nome, email, senha, papel } = dados;

        if (!nome || !email || senha === undefined) {
            throw { status: 400, mensagem: "Nome, email e senha são obrigatórios e devem ser válidos" };
        }

        const novoUsuario = {
            nome: nome.trim(),
            email: descricao.trim(),
            senha: senha,
            papel: papel.trim()
        };

        const id = await UsuarioRepository.create(novoProduto);

        return {
            sucesso: true,
            mensagem: "Usuário cadastrado com sucesso",
            id
        };
    }

    async atualizarUsuario(id, dados) {
        if (!id || isNaN(id)) {
            throw { status: 400, mensagem: "ID inválido" };
        }

        const existe = await UsuarioRepository.findById(id);
        if (!existe) {
            throw { status: 404, mensagem: "Usuário não encontrado" };
        }

        const atualizado = {};
        let { nome, email, senha, papel } = dados;

        if (nome !== undefined) atualizado.nome = nome.trim();
        if (email !== undefined) atualizado.descricao = descricao.trim();
        if (senha !== undefined) atualizado.preco = preco;
        if (papel !== undefined) atualizado.categoria = categoria;

        if (Object.keys(atualizado).length === 0) {
            throw { status: 400, mensagem: "Nenhum dado válido enviado para atualização" };
        }

        // Gerar o JWT
        const token = jwt.sign(
            { id: usuario.id, email: usuario.email, papel: usuario.papel },
            JWT_SECRET,
            { expiresIn: '8h'}
        );

        return {
            sucesso: true,
            mensagem: "Usuário atualizado com sucesso"
        };
    }

    async deletarUsuario(id) {
        if (!id || isNaN(id)) {
            throw { status: 400, mensagem: "ID inválido" };
        }

        const existe = await UsuarioRepository.findById(id);
        if (!existe) {
            throw { status: 404, mensagem: "Usuário não encontrado" };
        }

        if (existe.imagem) {
            const caminho = path.join(__dirname, '..', '..', 'public', existe.imagem);
            try {
                await fs.unlink(caminho);
            } catch (err) {
                console.error("Erro ao apagar imagem no deletar:", err);
            }
        }

        await ProdutoRepository.delete(id);

        return {
            sucesso: true,
            mensagem: "Produto apagado com sucesso"
        };
    }
}

module.exports = new ProdutoService();
