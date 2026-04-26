import { Nodo } from "../ast/Nodo";
import { Entorno } from "../entorno/Entorno";
import { Singleton } from "../utils/Singleton";
import { Funcion } from "../instrucciones/Funcion";

export class LlamadaFunc extends Nodo {
    constructor(public id: string, public argumentos: Nodo[], linea: number, columna: number) {
        super(linea, columna);
    }

    ejecutar(entorno: Entorno): any {
        const simbolo = entorno.obtener(this.id);
        
        if (!simbolo || simbolo.tipo !== 'funcion') {
            // Manejo de funciones nativas (como len o append)
            if (this.id === 'len' && this.argumentos.length === 1) {
                const arreglo = this.argumentos[0].ejecutar(entorno);
                return Array.isArray(arreglo) ? arreglo.length : 0;
            }
            if (this.id === 'append' && this.argumentos.length === 2) {
                const arreglo = this.argumentos[0].ejecutar(entorno);
                const valor = this.argumentos[1].ejecutar(entorno);
                if (Array.isArray(arreglo)) return [...arreglo, valor];
            }

            Singleton.getInstancia().addError("Semántico", `La función '${this.id}' no existe.`, this.linea, this.columna);
            return null;
        }

        const funcion = simbolo.valor as Funcion;
        
        // Creamos un nuevo entorno para la ejecución de la función
        const entornoLocal = new Entorno(entorno); // Idealmente debería apuntar al global directamente

        // Validar cantidad de parámetros
        if (this.argumentos.length !== funcion.parametros.length) {
            Singleton.getInstancia().addError("Semántico", `Cantidad de argumentos incorrecta para '${this.id}'`, this.linea, this.columna);
            return null;
        }

        // Asignar valores a los parámetros
        for (let i = 0; i < this.argumentos.length; i++) {
            const valorArg = this.argumentos[i].ejecutar(entorno);
            entornoLocal.guardar(funcion.parametros[i].id, valorArg, funcion.parametros[i].tipo);
        }

        // Ejecutar el bloque de la función
        for (const inst of funcion.bloque) {
            const resultado = inst.ejecutar(entornoLocal);
            // Si la instrucción retornó algo (ej. un return)
            if (resultado && typeof resultado === 'object' && resultado.tipo === 'return') {
                return resultado.valor;
            }
        }
        return null;
    }

    obtenerAST(nombrePadre: string): string {
        const id = `nodo_${Singleton.getInstancia().contadorAst++}`;
        let dot = `${id} [label="Llamada\\n${this.id}()"];\n${nombrePadre} -> ${id};\n`;
        this.argumentos.forEach(arg => { dot += arg.obtenerAST(id); });
        return dot;
    }
}