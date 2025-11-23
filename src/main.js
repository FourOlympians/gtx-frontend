import './styles.css'


const apiBaseUrl = import.meta.env.VITE_API_BASE_URL 

async function GetEjercicios() {
    
    try {
    
        const resp = await fetch(`${apiBaseUrl}/ejercicio`)
    
        if (!resp.ok) {
           console.log('Fallo el api') 
           return
        }
        
        const data = await resp.json()
        
        console.log(data)
    } catch(e) {
        console.log(`El error es: ${e}`)
    }

}    

async function CrearRutina() {
     try {
        const resp = await fetch(`${apiBaseUrl}/ejercicio/nueva_rutina`,
          {
            method: 'POST',
            headers: {
               'Content-Type': 'Application/json'
            },
            body: JSON.stringify({
                 nombre: 'Rutina vacaciones',
                 ejercicios: [
                    'Press banca',
                    'Laterales',
                    'Banco inclinado'
                 ]
            })
          }   
        )
    
        if (!resp.ok) {
           console.log('Fallo el api') 
           return
        }
        
        const data = await resp.json()
        
        console.log(data)
    } catch(e) {
        console.log(`El error es: ${e}`)
    }

   
}

CrearRutina()
//GetEjercicios()


