const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const Filter = require('bad-words')

const {generarMensaje} = require('./utils/mensajes')
const {addUsuario, removeUsuario, getUsuario, getUsuariosSala} = require('./utils/usuarios')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT || 3000
//test

//definicion de rutas para configuracion de express
const publicDirPath = path.join(__dirname, '../public')

//configuracion de contenido estatico
app.use(express.static(publicDirPath))

io.on('connection', (socket) => {
    console.log('Nueva Coneccion WebSocket')

    socket.on('unido', (opciones, callback)=>{
        const {error, usuario} = addUsuario({id: socket.id, ...opciones})

        if(error) return callback(error)
        
        socket.join(usuario.sala)
        
        socket.emit('enviarMensajeAll', generarMensaje('Admin', 'Bienvenido a chat app'))

        socket.broadcast.to(usuario.sala).emit('enviarMensajeAll', generarMensaje('Admin', `¡${usuario.nombreusuario} se ha conectado!`))

        io.to(usuario.sala).emit('datosSala', {
            sala: usuario.sala,
            usuarios: getUsuariosSala(usuario.sala)
        })

        callback()
    })

    socket.on('enviarMensaje', (msg, callback)=>{
        const usuario = getUsuario(socket.id)
        if(!usuario) return callback('usuario no encontrado')

        const filter = new Filter()
        filter.addWords('pico')
        if(filter.isProfane(msg)){
            return callback('No se permiten grocerias')
        }
        io.to(usuario.sala).emit('enviarMensajeAll', generarMensaje(usuario.nombreusuario, msg))
        callback()
    })

    socket.on('disconnect', ()=>{
        const usuario = removeUsuario(socket.id)
        if(usuario){
            io.to(usuario.sala).emit('enviarMensajeAll', generarMensaje('Admin', `usuario ${usuario.nombreusuario} se ha desconectado!`))
            io.to(usuario.sala).emit('datosSala', {
                sala: usuario.sala,
                usuarios: getUsuariosSala(usuario.sala)
            })
        } 
    })

    socket.on('enviarUbicacion', (posicion, callback)=>{
        const usuario = getUsuario(socket.id)
        if(!usuario) return callback('usuario no encontrado')
        io.to(usuario.sala).emit('enviarUbicacionAll', generarMensaje(usuario.nombreusuario, `https://google.com/maps?q=${posicion.latitude},${posicion.longitude}`))
        callback()
    })
});

//levantamiento de servidor
server.listen(port, ()=>{
    console.log('servidor escuchando en puerto '+ port)
})