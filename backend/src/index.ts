import express from 'express';
import cors from 'cors';
// @ts-ignore
import { parser } from './compilador/analizador/parser';
import { Entorno } from './compilador/entorno/Entorno';
import { Singleton } from './compilador/utils/Singleton'; 
const app = express();
const PORT = 4000; // Puedes usar el puerto que prefieras

// Middleware
app.use(cors());            // Permite que React (en el puerto 5173) se comunique con Node
app.use(express.json());    // Permite recibir cuerpos JSON en las peticiones

// Ruta de prueba para verificar que el servidor corre
app.get('/ping', (req, res) => {
    res.send('pong - El servidor está vivo');
});




app.post('/analizar', (req, res) => {
    try {
        const { codigo } = req.body;

        if (!codigo) {
            return res.status(400).json({ error: "No se recibió código" });
        }

        console.log(" Iniciando análisis de código...");

        // 1. Limpiar datos de la ejecución anterior (MUY IMPORTANTE)
         Singleton.getInstancia().reset();

        // 2. Ejecutar el Parser de Jison
        // Esto devolverá el AST (un arreglo con todas las instrucciones del código)
        const ast = parser.parse(codigo);

        // 3. Crear el Entorno Global
        const entornoGlobal = new Entorno(null);

        // 4. PRIMERA PASADA: Guardar entorno global (Funciones, Structs, Vars)
        // Recorremos el AST y ejecutamos las declaraciones para que se guarden en memoria
        for (const instruccion of ast) {
            try {
                instruccion.ejecutar(entornoGlobal);
            } catch (err) {
                console.log("Error al cargar instrucción global:", err);
            }
        }

       // 5. SEGUNDA PASADA: Buscar y ejecutar el main()
        const simboloMain = entornoGlobal.obtener("main");

        if (simboloMain) {
            try {
                // Sacamos el nodo de la función del símbolo guardado
                const funcionMain = simboloMain.valor; 

                // Creamos un Entorno LOCAL específico para la función main
                const entornoMain = new Entorno(entornoGlobal);

                // Ejecutamos las INSTRUCCIONES internas de la función, no la declaración
                // *Nota: Cambia "instrucciones" por el nombre de la propiedad que 
                // tenga tu clase (algunos le ponen "bloque", "codigo", etc.)
                const cuerpoMain = funcionMain.instrucciones || funcionMain.bloque;

                if (cuerpoMain) {
                    for (const instruccion of cuerpoMain) {
                        // Si es un return, break o continue, lo capturamos
                        const resultado = instruccion.ejecutar(entornoMain);
                        if (resultado && resultado.tipo === "return") {
                            break; // El main termina si hay un return
                        }
                    }
                } else {
                    console.log("La función main está vacía o no tiene la propiedad 'instrucciones'.");
                }
                
            } catch (e) {
                console.log("Error al ejecutar main:", e);
            }
        } else {
            console.log("No se encontró la función main()");
        }

        // 6. Recolectar resultados (USANDO TUS NUEVOS MÉTODOS)
        const textoConsola = Singleton.getInstancia().getConsola();
        const listaErrores = Singleton.getInstancia().getErrores();
        const listaSimbolos: any[] = [];

        // 7. Enviar todo de regreso al Frontend
        res.json({ 
            consola: textoConsola, 
            errores: listaErrores, 
            simbolos: listaSimbolos 
        });
        
    } catch (error) {
        // Si el parser.parse() falla (Error de sintaxis irrecuperable), cae aquí
        console.error(" Error fatal durante el análisis:", error);
        
        res.json({
            consola: "Error sintáctico/léxico irrecuperable.\n" + String(error),
            errores: [
                { tipo: "Fatal", descripcion: String(error), linea: 0, columna: 0 }
            ],
            simbolos: []
        });
    }
});

// Levantar el servidor
app.listen(PORT, () => {
    console.log(`==========================================`);
    console.log(` Servidor corriendo en http://localhost:${PORT}`);
    console.log(`==========================================`);
});