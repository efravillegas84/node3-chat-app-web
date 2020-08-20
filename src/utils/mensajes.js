const generarMensaje = (nombreusuario, texto)=>{
    return {
        nombreusuario,
        texto,
        createdAt: new Date().getTime()
    }
}

module.exports = {
    generarMensaje
}