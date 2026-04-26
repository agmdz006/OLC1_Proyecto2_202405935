import { Nodo } from "../ast/Nodo";
import { Entorno } from "../entorno/Entorno";
import { Singleton } from "../utils/Singleton";

export class InstanciaStruct extends Nodo {
    // Recibe un arreglo con {id: string, valor: Nodo}
    constructor(public atributos: any[], linea: number, columna: number) {
        super(linea, columna);
    }

    ejecutar(entorno: Entorno): any {
        const structObj: any = {};
        
        // Evaluamos cada atributo y lo guardamos en nuestro objeto
        for (const atributo of this.atributos) {
            const valorEvaluado = atributo.valor.ejecutar(entorno);
            structObj[atributo.id] = valorEvaluado;
        }
        
        // Retornamos el objeto completo listo para ser guardado en la variable
        return structObj;
    }

    obtenerAST(nombrePadre: string): string {
        const id = `nodo_${Singleton.getInstancia().contadorAst++}`;
        return `${id} [label="Instancia Struct"];\n${nombrePadre} -> ${id};\n`;
    }
}