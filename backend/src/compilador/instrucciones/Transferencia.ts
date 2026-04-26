import { Nodo } from "../ast/Nodo";
import { Entorno } from "../entorno/Entorno";
import { Singleton } from "../utils/Singleton";

export class Break extends Nodo {

    constructor(linea: number, columna: number){
        super(linea, columna);
    }
    ejecutar(entorno: Entorno): any {
        return 'break';
    }
    obtenerAST(nombrePadre: string): string {
        const id = `nodo_${Singleton.getInstancia().contadorAst++}`;
        return `${id} [label="Break"];\n${nombrePadre} -> ${id};\n`;
    }
}

export class Continue extends Nodo {

    constructor(linea: number, columna: number){
        super(linea, columna);
    }
    
    ejecutar(entorno: Entorno): any {
        return 'continue';
    }
    obtenerAST(nombrePadre: string): string {
        const id = `nodo_${Singleton.getInstancia().contadorAst++}`;
        return `${id} [label="Continue"];\n${nombrePadre} -> ${id};\n`;
    }
}