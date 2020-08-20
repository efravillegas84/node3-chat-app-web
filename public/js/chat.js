const socket = io();

//Elementos
const $mensajeform = document.querySelector('#mensaje-form')
const $msgTxt = $mensajeform.msgTxt
const $msgBtn = $mensajeform.msgBtn
const $enviarubicacion = document.querySelector('#enviar-ubicacion')
const $mensajes = document.querySelector('#mensajes')
const $barraLateral = document.querySelector('#barraLateral')

//templates
const mensajeTemplate = document.querySelector('#mensaje-template').innerHTML
const ubicacionTemplate = document.querySelector('#ubicacion-template').innerHTML
const barralateralTemplate = document.querySelector('#barralateral-template').innerHTML

//Opciones
const {nombreusuario, sala} = Qs.parse(location.search, {ignoreQueryPrefix: true})

const autoscroll = ()=>{
    //Elelento nuevo mensaje
    const $nuevoMensaje = $mensajes.lastElementChild

    //altura de nuevo mensaje
    const stylesNuevoMensaje = getComputedStyle($nuevoMensaje)
    const marginNuevoMensaje = parseInt(stylesNuevoMensaje.marginBottom)
    const alturaNuevoMensaje = $nuevoMensaje.offsetHeight + marginNuevoMensaje

    //altura visible chat
    const alturaVisible = $mensajes.offsetHeight

    //altura contnedor de mensajes
    const alturaContenedor = $mensajes.scrollHeight

    //que tanto se ha desplazado el scroll
    const desplazamientoOffset = $mensajes.scrollTop + alturaVisible

    if(alturaContenedor - alturaVisible <= desplazamientoOffset){
        $mensajes.scrollTop = $mensajes.scrollHeight
    }
}

//RECEPCION
socket.on('enviarMensajeAll', (msg)=>{
    console.log(msg)
    const html = Mustache.render(mensajeTemplate, {
        nombreusuario: msg.nombreusuario,
        mensaje:msg.texto,
        createdAt: moment(msg.createdAt).format('HH:mm')
    })
    $mensajes.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

socket.on('enviarUbicacionAll', (ubicacion)=>{
    console.log(ubicacion)
    const html = Mustache.render(ubicacionTemplate, {
        nombreusuario: ubicacion.nombreusuario,
        ubicacion:ubicacion.texto,
        createdAt: moment(ubicacion.createdAt).format('HH:mm')
    })
    $mensajes.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

socket.on('datosSala', ({sala, usuarios})=>{
    const html = Mustache.render(barralateralTemplate, {
        sala,
        usuarios
    })
    $barraLateral.innerHTML = html
})

// ENVIO
$mensajeform.addEventListener('submit', (e)=>{
    e.preventDefault()

    $msgBtn.setAttribute('disabled', 'disabled')

    socket.emit('enviarMensaje', 
        //document.querySelector('#mensaje-form input').value
        //e.target.elements.msgTxt.value 
        $msgTxt.value
        ,(error)=>{
            $msgBtn.removeAttribute('disabled')
            $msgTxt.value = ''
            $msgTxt.focus()

            if(error)return console.log(error)

            console.log('el mensaje fue entregado')
    })
})

$enviarubicacion.addEventListener('click', (e)=>{
    if(!navigator.geolocation)return alert('Este Navegador no soporta geolocation')

    $enviarubicacion.setAttribute('disabled', 'disabled')

    navigator.geolocation.getCurrentPosition((position)=>{
        socket.emit('enviarUbicacion', {
            latitude: position.coords.latitude, 
            longitude: position.coords.longitude
        }, ()=>{
            $enviarubicacion.removeAttribute('disabled')
            console.log('ubicacion entregada')
        })
    })
})

socket.emit('unido', {nombreusuario, sala}, (error)=>{
    if(error){
        alert(error)
        location.href = '/'
    }
})