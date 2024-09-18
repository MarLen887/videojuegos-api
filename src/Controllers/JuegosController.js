import mongoose, { Schema } from "mongoose";
import * as fs from 'fs'

const esquema = new mongoose.Schema({
    nombre:String, imagen:String, niveles:Number, fecha:Date
},{versionKey:false})

const JugoModel = new mongoose.model('juegos',esquema)

export const getJuegos = async(req,res) =>{
    try{
        const {id} = req.params
        const rows= 
        (id == undefined) ? await JugoModel.find() : await JugoModel.findById(id)
        return res.status(200).json({status:true,data:rows})
    }
    catch(error){
        return res.status(500).json({status:false,errors:[error]})
    }
}

export const saveJuego = async(req,res) =>{
    try {
        const {nombre,niveles,fecha} = req.body
        const validacion = validar(nombre,niveles,fecha,req.file,'Y')
        if (validacion == '') {
            const nuevojuego = new JugoModel({
                nombre:nombre,niveles:niveles,fecha:fecha,
                imagen:'/uploads/'+req.file.filename
            })
            return await nuevojuego.save().then(
                () => { res.status(200).json({status:true,message:'Juego guardado'}) }
            )
        }
        else{
            return res.status(400).json({status:false,errors:validacion})
        }

    } catch (error) {
        return res.status(500).json({status:false,errors:[error.message]})
    }
}


export const updateJuego = async(req,res) =>{
    try {
        const {id} = req.params
        const {nombre,niveles,fecha} = req.body
        let imagen = ''
        let valores = {nombre:nombre,niveles:niveles,fecha:fecha}
        if(req.file != null){
            imagen = '/uploads/'+req.file.filename
            valores = {nombre:nombre,niveles:niveles,fecha:fecha,imagen:imagen}
            await eliminarimagen(id)

        }
        const validacion = validar(nombre,niveles,fecha)
        if (validacion == '') {
            await JugoModel.updateOne({_id:id},{$set:valores})
            return res.status(200).json({status:true,message:'Juego actualizado'})
            
        }
        else{
            return res.status(400).json({status:false,errors:validacion})
        }

    } catch (error) {
        return res.status(500).json({status:false,errors:[error.message]})
    }
}

export const deleteJuego = async(req,res) =>{
    try {
        const {id} = req.params
        await eliminarimagen(id)
        await JugoModel.deleteOne({_id:id})
        return res.status(200).json({status:true,message:'Juego eliminado'})

    } catch (error) {
        return res.status(500).json({status:false,errors:[error.message]})
    }
}

const eliminarimagen = async(id)=>{
    const juego = await JugoModel.findById(id)
    const img = juego.imagen
    fs.unlinkSync('./public/'+img)
}

const validar = (nombre,niveles,fecha,img,sevalida) =>{
    var errors = []
    if (nombre === undefined || nombre.trim() === '') {
        errors.push('El nombre NO debe de estar vacio')
    }
    if (niveles === undefined || niveles.trim() === '' || isNaN(niveles)) {
        errors.push('El numero de niveles NO debe de estar vacio y debe ser numérico')
    }
    if (fecha === undefined || fecha.trim() === '' || isNaN(Date.parse(fecha))) {
        errors.push('La fecha NO debe de estar vacia y debe ser una fecha valida')
    }
    if (sevalida === 'Y' && img === undefined) {
        errors.push('Selecciona una imagen en formato jpg o png')
    }
    else{
        if(errors != ''){
            fs.unlinkSync('./public/uploads/'+img.filename)
        }
    }
    return errors
}