import { Nodo } from "../ast/Nodo";
import { Entorno } from "../entorno/Entorno";
import { Singleton } from "../utils/Singleton";

export class LlamadaNativa extends Nodo {
    
    constructor(
        private identificador: string,
        private argumentos: Nodo[],
        linea: number,
        columna: number
    ) {
        super(linea, columna);
    }

    public ejecutar(entorno: Entorno): any {
        // 1. Ejecutar todos los argumentos primero
        const valoresArgs = this.argumentos.map(arg => arg.ejecutar(entorno));

        // Validar si algún argumento dio error
        if (valoresArgs.includes(null) || valoresArgs.some(v => v === undefined)) {
            return null; 
        }

        // 2. Comportamiento según la función nativa llamada
        switch (this.identificador.toLowerCase()) {
            
            case "len":
                if (this.argumentos.length !== 1) {
                    Singleton.getInstancia().addError("Semántico", `La función 'len' espera exactamente 1 argumento.`, this.linea, this.columna);
                    return null;
                }
                const argLen = valoresArgs[0];
                
                // len() funciona con Strings y Arreglos (Slices) nativos
                if (typeof argLen === 'string' || Array.isArray(argLen)) {
                    // Retornamos el número directamente, sin objetos encapsulados
                    return argLen.length;
                }
                
                Singleton.getInstancia().addError("Semántico", `Tipo de dato no soportado para 'len'.`, this.linea, this.columna);
                return null;

            case "append":
                if (this.argumentos.length < 2) {
                    Singleton.getInstancia().addError("Semántico", "La función 'append' espera al menos 2 argumentos.", this.linea, this.columna);
                    return null;
                }
                const arreglo = valoresArgs[0];
                const nuevoElemento = valoresArgs[1]; // El valor a agregar
                
                if (!Array.isArray(arreglo)) {
                    Singleton.getInstancia().addError("Semántico", "El primer argumento de 'append' debe ser un SLICE.", this.linea, this.columna);
                    return null;
                }

                // Retornamos un clon del arreglo nativo + el nuevo elemento
                return [...arreglo, nuevoElemento];

            // ----- FUNCIONES REQUERIDAS POR LA PRUEBA DE FUNCIONES -----
            case "atoi":
                if (typeof valoresArgs[0] === 'string') {
                    return parseInt(valoresArgs[0]);
                }
                Singleton.getInstancia().addError("Semántico", "strconv.Atoi espera un string.", this.linea, this.columna);
                return null;

            case "parsefloat":
                if (typeof valoresArgs[0] === 'string') {
                    return parseFloat(valoresArgs[0]);
                }
                Singleton.getInstancia().addError("Semántico", "strconv.ParseFloat espera un string.", this.linea, this.columna);
                return null;

            case "typeof":
                // reflect.TypeOf() te pide el tipo como string
                const valor = valoresArgs[0];
                if (typeof valor === 'number') {
                    // Si no tiene decimales, asumimos int, de lo contrario float64
                    return (valor % 1 === 0) ? "int" : "float64";
                }
                if (typeof valor === 'string') return "string";
                if (typeof valor === 'boolean') return "bool";
                if (Array.isArray(valor)) return "slice";
                if (typeof valor === 'object') return "struct";
                return "unknown";


            case 'index':
                const arregloIndex = this.argumentos[0].ejecutar(entorno);
                const valorBuscado = this.argumentos[1].ejecutar(entorno);
                if (Array.isArray(arregloIndex)) {
                    // indexOf busca el elemento y devuelve su posición (o -1 si no existe)
                    return arregloIndex.indexOf(valorBuscado);
                }
                return -1;

            case 'join':
                const arregloJoin = this.argumentos[0].ejecutar(entorno);
                const separador = this.argumentos[1].ejecutar(entorno);
                if (Array.isArray(arregloJoin)) {
                    // join une todo el arreglo usando el separador indicado
                    return arregloJoin.join(separador);
                }
                return "";

            default:
                Singleton.getInstancia().addError("Semántico", `La función nativa '${this.identificador}' no existe.`, this.linea, this.columna);
                return null;
        }
    }

    public obtenerAST(nombrePadre: string): string {
        const id = `nodo_${this.linea}_${this.columna}_${Math.floor(Math.random() * 1000)}`;
        let dot = `${id}[label="Llamada Nativa\\n${this.identificador}"];\n`;
        dot += `${nombrePadre} -> ${id};\n`;
        
        // Graficar los argumentos como hijos
        this.argumentos.forEach(arg => {
            if (arg) dot += arg.obtenerAST(id);
        });
        
        return dot;
    }
}