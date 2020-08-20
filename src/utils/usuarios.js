const usuarios = []

const addUsuario = ({id, nombreusuario, sala})=>{
    //limpieza
    nombreusuario = nombreusuario.trim().toLowerCase()
    sala = sala.trim().toLowerCase()

    //validacion
    if(!nombreusuario || !sala)return {error: 'Nombre de usuario y sala son obligatorios'}

    //validacion de usuario existente
    const usuarioExistente = usuarios.find((usuario)=>{
        return usuario.sala === sala && usuario.nombreusuario === nombreusuario
    })
    if(usuarioExistente) return {error: 'Nombre de usuario esta siendo usado en la sala'}

    //guardar usuario
    const usuario = {id, nombreusuario, sala}
    usuarios.push(usuario)
    
    return {usuario}
}

const removeUsuario = (id)=>{
    const index = usuarios.findIndex((usuario)=>usuario.id === id)

    if(index !== -1) return usuarios.splice(index, 1)[0]
}

const getUsuario = (id)=>{
    return usuarios.find((usuario)=> usuario.id === id)
}

const getUsuariosSala = (sala)=>{
    return usuarios.filter((usuario)=>usuario.sala === sala)
}

module.exports = {
    addUsuario,
    removeUsuario,
    getUsuario,
    getUsuariosSala
}
