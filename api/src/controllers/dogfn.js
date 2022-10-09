const axios = require("axios");
const { Dog, Temperament } = require("../db");
const { Op } = require("sequelize");
const { KEY } = process.env;

/**
 * OBTENER DATA PARA RUTA PRINCIPAL.
 * getDogs
 * Función que sirve los datos traidos desde la API externa y BD, puestos
 * a disposición de allDogs para mostrarlos al front.
 *
 * READY
 */

getDogs = async (req, res) => {
  try {
    const getapi = await axios.get(`https://api.thedogapi.com/v1/breeds`);
    const mapapi = getapi.data.map((item) => {
      return {
        id: item.id,
        name: item.name,
        image: item.image.url,
        weight: item.weight.metric,//.split(' - '),
        // .map(char => {
        //   return{
        //     min:char.slice(),
        //     max:char.slice(1)
        //   }
        // }),
        temperament: item.temperament,
      };
    });
    const getbd = await Dog.findAll({
      include: {
        model: Temperament,
        attributes: ['name'],
        through: {attributes:[]},
      },
    });//Traer los temperamentos
    console.log(mapapi);
    return [...mapapi, ...getbd];
    //return res.send(mapapi);
  } catch (error) {
    console.log(error);
  }
};
//======================================================

/**
 * PONER A DISPOSICIÓN DEL FRONT LA DATA MEDIANTE DOGSBYNAME.
 * allDogs
 * Función que llama a getDogs, sirviendo los datos indirectamente al front. 
 * READY
 */

allDogs = async() => {
  const item = await getDogs();
  return item;
};
//=========================================================

/**
 * REALIZAR BUSQUEDA DE DOGS POR NOMBRE.
 * Poner a disposición del front los datos en la ruta principal, determinar
 * si viene una busqueda por query o solo servir los datos generales directamente.
 * READY
 */
dogsByName = async (req, res) => {
  try {
    const alldogs = await allDogs();
    const { name } = req.query;
    if(name){
      console.log(name);
      const filterName = alldogs.filter(dog => {
        const datalower = dog.name.toLowerCase();
        const nameLower = name.toLowerCase();
        if(datalower.includes(nameLower)){
          return dog
        }
      });
      filterName.length ? res.status(200).send(filterName) : res.status(404).send('Dog not found');
    }else{
      return res.status(200).send(alldogs);
    }
  } catch (error) {
    console.log(error);
  };
};
//========================================================

/**
 * TRAER DOG POR ID
 * dogById
 * Función que trae desde la api externa y la bd, los datos referentes a una
 * raza en particular, discriminado por el Id.
 * NOT READY JET
 */

dogById = async(req, res) => {
  const { id } = req.params;
  const idUPPER = id.toUpperCase();
  try {
    const getbd = await Dog.findOne({
      where:{id:idUPPER},
      include:{
        model:Temperament,
        attributes:['name'],
        through:{attributes:[]},
      }
    });
    console.log('BD', getbd);
    if(getbd){
      return res.status(200).send(getbd);
    }else{
      const getapi = (await axios.get('https://api.thedogapi.com/v1/breeds')).data;
      console.log(getapi);
      //const { name, image, height, weight, life_span, temperament } = getapi;}
      console.log('params ',id);
      const gotdata = getapi.filter(filtered => parseInt(filtered.id) === parseInt(id));
      console.log(gotdata);
      res.status(200).send(gotdata);
    }
  } catch (error) {
    console.log(error);
    res.status(404).send(`Id ${id} not found`);
  }
}

//#######################################################
module.exports = {
  dogsByName,
  dogById,
};
