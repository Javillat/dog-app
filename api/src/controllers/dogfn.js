const axios = require("axios");
const { Dog, Temperament } = require("../db");
const { Op } = require("sequelize");
const { KEY, DOGAPI_KEY } = process.env;

/**
 * OBTENER DATA PARA RUTA PRINCIPAL.
 * getDogs
 * Función que sirve los datos traidos desde la API externa y BD, puestos
 * a disposición de allDogs para mostrarlos al front.
 *
 * READY
 */

// getDogs = async () => {
//   try {
//     const headers = new Headers({
//       "Content-Type": "application/json",
//       "x-api-key": DOGAPI_KEY
//     });
    
//     var requestOptions = {
//       method: 'GET',
//       headers: headers,
//       redirect: 'follow'
//     };
    
//     fetch("https://api.thedogapi.com/v1/images/search?size=med&mime_types=jpg&format=json&has_breeds=true&order=RANDOM&page=0&limit=100", requestOptions)
//       .then(response => response.text())
//       .then(result => console.log(result))
//       .catch(error => console.log('error', error));  
//   }
//   catch(error){

//   }
// }
getDogs = async (req, res) => {
  try {
    // let arrayapi = [];
    
    // //for (let i = 0; i <= 10; i++) {
    //   const URLDOG = 'https://api.thedogapi.com/v1/images/search';
    //   // const getimageapi = await axios.get(URLDOG, { 
    //   const getimageapi = (await axios.get(URLDOG, {
    //     headers: {
    //       'x-api-key': DOGAPI_KEY
    //     },
    //     params: {
    //       limit: 100,
    //       page: 0,
    //       has_breeds: 1
    //       //order : 'ASC'
    //     }
    //   })).data;
    //   console.log(getimageapi);
      
    //   //console.log(`${i}° Pagina,`, getimageapi.length, 'Registros');//Para ver el progreso del fetch
    //   arrayapi.push(getimageapi);
    // //}//Fin bucle for
    // const flatarray = arrayapi.flat(1);
    // const mapapi = flatarray.map((item) => {
    //   const weightminmax = item.breeds[0].weight.metric.split(" - ");
    //   return {
    //     id: item.breeds[0].id,
    //     name: item.breeds[0].name,
    //     image: item.url,
    //     idimg: item.id,
    //     temperament: item.breeds[0].temperament,
    //     min_weight: weightminmax[0],
    //     max_weight: weightminmax[1]
    //   };
    // })

    // const DOGAPI_KEY = 'your_api_key';
const URLDOG = 'https://api.thedogapi.com/v1/images/search';

// async function fetchDogData() {
  // Array de solicitudes concurrentes para distintas páginas
  const requests = Array.from({ length: 60 }, (_, i) => 
    axios.get(URLDOG, {
      headers: {
        'x-api-key': DOGAPI_KEY
      },
      params: {
        limit: 8,
        page: i,       // Se usa 'i' para paginar cada solicitud
        has_breeds: 1
      }
    })
  );

  // Realizar las solicitudes en paralelo y mapear los resultados
  const results = await Promise.all(requests);
  const formattedData = results.flatMap(result => 
    result.data.map(item => {
      // Verifica que 'breeds' no esté vacío antes de acceder
      if (item.breeds && item.breeds.length > 0) {
        const weightMinMax = item.breeds[0].weight.metric.split(" - ");
        return {
          id: item.breeds[0].id,
          name: item.breeds[0].name,
          image: item.url,
          idimg: item.id,
          temperament: item.breeds[0].temperament,
          min_weight: weightMinMax[0],
          max_weight: weightMinMax[1]
        };
      }
    }).filter(Boolean) // Elimina valores undefined si no hay datos en 'breeds'
  );

// Llamada a la función con 3 páginas para optimizar la carga
// const arrayapi = await fetchDogData(3);
// console.log(arrayapi);


      //FIltrar todos los objetos que sean repetidos.
      filtermapapi = formattedData.filter((v, i, a) => a.findIndex(t => (t.id === v.id)) === i);
      
    
    // }));
    //arrayapi.push(...mapapi)
    const getbd = await Dog.findAll({
      include: {
        model: Temperament,
        attributes: ["name"],
        through: { attributes: [] },
      },
    }); //Traer los temperamentos
    const mapbd = getbd.map((item) => {//Mapear los items de la bd, para enviar como string los temperamentos
      return {
        id: item.id,
        name: item.name,
        image: item.image,
        idimg: item.id,
        min_weight: item.minweight,
        max_weight: item.maxweight,
        temperament: item.temperaments.map(temperament => temperament.name).join(', '),
      }
    })
    console.log(mapbd);
    return [...filtermapapi, ...mapbd];
  } catch (error) {
    console.log(error);
  }
}

// getDogs = async (req, res) => {
//   try {
//     //https://api.thedogapi.com/v1/images/search?limit=100&page=0&has_breeds=1&api_key=live_wc4TK5ddDLtQktUPNS4SyHYlzx2JPDBqu0ashjCJZgpS2gyPdjBeuTFwE9oTqxa4
//     const getimageapi = await axios.get(`https://api.thedogapi.com/v1/images/search?limit=100&page=0&has_breeds=1&api_key=${DOGAPI_KEY}`);
//     console.log(getimageapi);
//     const getapi = await axios.get(`https://api.thedogapi.com/v1/breeds`);
//     const mapapi = getapi.data.map((item) => {
//       const weightminmax = item.weight.metric.split(" - ");
//       //const imageurl = await axios.get(`https://api.thedogapi.com/v1/images/${item.reference_image_id}`);
//       return {
//         id: item.id,
//         name: item.name,
//         // image: imageurl,
//         image: item.reference_image_id,
//         min_weight: weightminmax[0],
//         max_weight: weightminmax[1],
//         temperament: item.temperament,
//       };
//     });
//     const getbd = await Dog.findAll({
//       include: {
//         model: Temperament,
//         attributes: ["name"],
//         through: { attributes: [] },
//       },
//     }); //Traer los temperamentos
//     const mapbd = getbd.map((item) => {//Mapear los items de la bd, para enviar como string los temperamentos
//       return {
//         id:item.id,
//         name:item.name,
//         image:item.image,
//         min_weight:item.minweight,
//         max_weight:item.maxweight,
//         temperament:item.temperaments.map(temperament => temperament.name).join(', '),
//       }
//     })
//     console.log('Mappedbd', mapbd);
//     //console.log(mapapi);
//     return [...mapapi, ...mapbd];
//     //return res.send(mapapi);
//   } catch (error) {
//     console.log(error);
//   }
// };
//======================================================

/**
 * PONER A DISPOSICIÓN DEL FRONT LA DATA MEDIANTE DOGSBYNAME.
 * allDogs
 * Función que llama a getDogs, sirviendo los datos indirectamente al front.
 * READY
 */

allDogs = async () => {
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
    if (name) {
      console.log(name);
      const filterName = alldogs.filter((dog) => {
        const datalower = dog.name.toLowerCase();
        const nameLower = name.toLowerCase();
        if (datalower.includes(nameLower)) {
          return dog;
        }
      });
      filterName.length
        ? res.status(200).send(filterName)
        : res.status(404).send("Breer not found");
    } else {
      return res.status(200).send(alldogs);
    }
  } catch (error) {
    console.log(error);
  }
};
//========================================================

/**
 * TRAER DOG POR ID
 * dogById
 * Función que trae desde la api externa y la bd, los datos referentes a una
 * raza en particular, discriminado por el Id.
 * READY
 */

dogById = async (req, res) => {
  const { id } = req.params;
  const idUPPER = id.toUpperCase();
  try {
    const getbd = await Dog.findOne({
      where: { id: idUPPER },
      include: {
        model: Temperament,
        attributes: ["name"],
        through: { attributes: [] },
      },
    });
    console.log("BD", getbd);
    if (getbd) {
      return res.status(200).send(getbd);
    } else {
      // const getapi = (await axios.get("https://api.thedogapi.com/v1/breeds"))
      let getapi = await axios.get(`https://api.thedogapi.com/v1/images/${id}`);
      //console.log(getapi);

      const weightminmax = getapi.data.breeds[0].weight.metric.split(" - ");
      const heightminmax = getapi.data.breeds[0].height.metric.split(" - ");
      const lifespan = getapi.data.breeds[0].life_span.slice(0, 7).split(" - ");

      const serveddata = {
        id: getapi.data.id,
        image: getapi.data.url,
        name: getapi.data.breeds[0].name,
        temperament: getapi.data.breeds[0].temperament,
        min_weight: weightminmax[0],
        max_weight: weightminmax[1],
        min_height: heightminmax[0],
        max_height: heightminmax[1],
        min_life_span: lifespan[0],
        max_life_span: lifespan[1],
        origin: getapi.data.origin ? getapi.data.origin : "Whitout origin",
      };

      res.status(200).send(serveddata);
    }
  } catch (error) {
    console.log(error);
    res.status(404).send(`Id ${id} not found`);
  }
};
//========================================================

/**
 * _isAttribute: [Function (anonymous)],
  getTemperaments: [Function (anonymous)],
  countTemperaments: [Function (anonymous)],
  hasTemperament: [Function (anonymous)],
  hasTemperaments: [Function (anonymous)],
  setTemperaments: [Function (anonymous)],
  addTemperament: [Function (anonymous)],
  addTemperaments: [Function (anonymous)],
  removeTemperament: [Function (anonymous)],
  removeTemperaments: [Function (anonymous)],
  createTemperament: [Function (anonymous)]
 * POST BREEDS
 * Función para crear razas de perros, obtiene los datos desde un formulario en el front
 * los procesa y establece las relaciones necesarios con temperament.
 * READY
 */

breedPost = async (req, res) => {
  const { name, minheight, maxheight, minweight, maxweight, image, origin, life_span, tempid } = req.body;
  try {
    const findone = await Dog.findOne({
      where: { name: { [Op.eq]: name } }
    });
    if (!findone) {
      const idCount = (await Dog.count()) + 1;
      const idString = 'BD-' + idCount;
      const breed = await Dog.create({
        id: idString,
        name: name,
        minheight: minheight,
        maxheight: maxheight,
        minweight: minweight,
        maxweight: maxweight,
        origin: origin,
        life_span: life_span,
        image: image || 'https://thumbs.dreamstime.com/z/group-twelve-dogs-24189584.jpg'
      });
      //console.log('Proto ',breed.__proto__);
      await breed.addTemperaments(tempid);
      return res.status(201).send('Breed succefull created');
    } else {
      return res.status(304).json('Breed already exist into db, not modyfied');
    }
  } catch (error) {
    console.log(error);
  }
}

//#######################################################
module.exports = {
  dogsByName,
  dogById,
  breedPost,
};
