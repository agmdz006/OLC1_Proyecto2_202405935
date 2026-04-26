/* =====================================================================
   ANALIZADOR LÉXICO Y SINTÁCTICO - GOSCRIPT (USAC - OLC1)
   ===================================================================== */

%{
    const { 
        Primitivo, Aritmetica, Relacional, Logica, 
        AccesoVariable, AccesoSlice, AccesoStruct, 
        LlamadaFunc, LlamadaNativa, InstanciaSlice, MultiInstanciaSlice, InstanciaStruct 
    } = require('../expresiones');
    
    const { 
        Declaracion, Asignacion, Imprimir, If, Switch, Case, For, ForRange, 
        Funcion, StructDec, Return, Break, Continue, Bloque
    } = require('../instrucciones');
%}

%lex
%options case-sensitive

entero        [0-9]+
decimal       [0-9]+"."[0-9]+
identificador [a-zA-Z_][a-zA-Z0-9_]*

%%

\s+                   /* omitir espacios */
"//".* /* omitir comentario linea */
"/*"[\s\S]*?"*/"      /* omitir comentario multilinea */

// Palabras Reservadas
"var"                 return 'R_VAR';
"func"                return 'R_FUNC';
"return"              return 'R_RETURN';
"if"                  return 'R_IF';
"else"                return 'R_ELSE';
"switch"              return 'R_SWITCH';
"case"                return 'R_CASE';
"default"             return 'R_DEFAULT';
"for"                 return 'R_FOR';
"break"               return 'R_BREAK';
"continue"            return 'R_CONTINUE';
"range"               return 'R_RANGE';
"struct"              return 'R_STRUCT';
"nil"                 return 'R_NIL';
"true"                return 'R_TRUE';
"false"               return 'R_FALSE';

// Tipos de Datos
"int"                 return 'R_INT';
"float64"             return 'R_FLOAT64';
"string"              return 'R_STRING';
"bool"                return 'R_BOOL';
"char"                return 'R_CHAR';
"rune"                return 'R_RUNE';

// Funciones Nativas
"fmt"                 return 'R_FMT';
"Println"             return 'R_PRINTLN';
"Print"               return 'R_PRINT';
"strconv"             return 'R_STRCONV';
"Atoi"                return 'R_ATOI';
"ParseFloat"          return 'R_PARSEFLOAT';
"reflect"             return 'R_REFLECT';
"TypeOf"              return 'R_TYPEOF';
"len"                 return 'R_LEN';
"append"              return 'R_APPEND';
"slices"              return 'R_SLICES';
"Index"               return 'R_INDEX';
"strings"             return 'R_STRINGS';
"Join"                return 'R_JOIN';

// Operadores
":="                  return 'DECL_CORTA';
"+="                  return 'MAS_IGUAL';
"-="                  return 'MENOS_IGUAL';
"++"                  return 'INCREMENTO';
"--"                  return 'DECREMENTO';
"=="                  return 'IGUAL_IGUAL';
"!="                  return 'DIFERENTE';
"<="                  return 'MENOR_IGUAL';
">="                  return 'MAYOR_IGUAL';
"&&"                  return 'AND';
"||"                  return 'OR';

"+"                   return 'MAS';
"-"                   return 'MENOS';
"*"                   return 'POR';
"/"                   return 'DIVIDIDO';
"%"                   return 'MODULO';
"<"                   return 'MENOR';
">"                   return 'MAYOR';
"!"                   return 'NOT';
"="                   return 'IGUAL';
"_"                   return 'GUION_BAJO';
";"                   return 'PTCOMA';
":"                   return 'DOS_PUNTOS';
","                   return 'COMA';
"."                   return 'PUNTO';
"("                   return 'PAR_IZQ';
")"                   return 'PAR_DER';
"{"                   return 'LLAVE_IZQ';
"}"                   return 'LLAVE_DER';
"["                   return 'COR_IZQ';
"]"                   return 'COR_DER';

{decimal}             return 'DECIMAL';
{entero}              return 'ENTERO';

// REGLAS PARA CADENAS Y CARACTERES
["](?:[^"\\]|\\.)*["] { 
    yytext = yytext.slice(1, -1).replace(/\\n/g, '\n').replace(/\\t/g, '\t').replace(/\\"/g, '"').replace(/\\\\/g, '\\'); 
    return 'CADENA'; 
}

['](?:[^'\\]|\\.)[']  { 
    yytext = yytext.slice(1, -1).replace(/\\n/g, '\n').replace(/\\t/g, '\t').replace(/\\'/g, "'").replace(/\\\\/g, '\\'); 
    return 'CARACTER'; 
}

{identificador}       return 'IDENTIFICADOR';

<<EOF>>               return 'EOF';
.                     { console.error("Error léxico: " + yytext); }

/lex

%left 'OR'
%left 'AND'
%left 'IGUAL_IGUAL' 'DIFERENTE'
%left 'MENOR' 'MAYOR' 'MENOR_IGUAL' 'MAYOR_IGUAL'
%left 'MAS' 'MENOS'
%left 'POR' 'DIVIDIDO' 'MODULO'
%right 'NOT' 'UMENOS'

%start inicio

%%

inicio
    : instrucciones EOF { return $1; }
    ;

instrucciones
    : instrucciones instruccion { $1.push($2); $$ = $1; }
    | instruccion               { $$ = [$1]; }
    ;

ptcoma : 'PTCOMA' | ;

tipo_dato
    : 'R_INT'                       { $$ = "int"; }
    | 'R_FLOAT64'                   { $$ = "float64"; }
    | 'R_STRING'                    { $$ = "string"; }
    | 'R_BOOL'                      { $$ = "bool"; }
    | 'R_CHAR'                      { $$ = "char"; }
    | 'R_RUNE'                      { $$ = "rune"; } 
    ;

tipo_var
    : tipo_dato                     { $$ = $1; }
    | IDENTIFICADOR                 { $$ = $1; }
    // La magia recursiva para CUALQUIER tipo de array (Slices de primitivos o Structs)
    | 'COR_IZQ' 'COR_DER' tipo_var  { $$ = "[]" + $3; }
    ;

asignacion
    : IDENTIFICADOR IGUAL expresion     { $$ = new Asignacion($1, $3); }
    | IDENTIFICADOR MAS_IGUAL expresion { $$ = new AsignacionSuma($1, $3); }
    ;

declaracion
    : R_VAR IDENTIFICADOR tipo_var IGUAL expresion
    | tipo_var IDENTIFICADOR IGUAL expresion  
    ;

instruccion
    // Declaraciones directas (Primitivos: string serie = "X";)
    : tipo_dato IDENTIFICADOR 'IGUAL' expresion ptcoma
        { $$ = new Declaracion($2, $1, $4, @1.first_line, @1.first_column); }
    
    // Declaraciones directas (Structs: Chip miChip = {...};)
    | IDENTIFICADOR IDENTIFICADOR 'IGUAL' expresion ptcoma
        { $$ = new Declaracion($2, $1, $4, @1.first_line, @1.first_column); }

    // Declaraciones con "var"
    | 'R_VAR' IDENTIFICADOR tipo_var 'IGUAL' expresion ptcoma
        { $$ = new Declaracion($2, $3, $5, @1.first_line, @1.first_column); }
    | 'R_VAR' IDENTIFICADOR tipo_var ptcoma
        { $$ = new Declaracion($2, $3, null, @1.first_line, @1.first_column); }
        
    // Asignaciones y Operaciones cortas
    | IDENTIFICADOR 'DECL_CORTA' expresion ptcoma
        { $$ = new Declaracion($1, null, $3, @1.first_line, @1.first_column); }
    | expresion 'IGUAL' expresion ptcoma
        { $$ = new Asignacion($1, $3, @1.first_line, @1.first_column); }
    | expresion 'MAS_IGUAL' expresion ptcoma
        { $$ = new Asignacion($1, new Aritmetica($1, '+', $3, @2.first_line, @2.first_column), @1.first_line, @1.first_column); }
    | expresion 'MENOS_IGUAL' expresion ptcoma
        { $$ = new Asignacion($1, new Aritmetica($1, '-', $3, @2.first_line, @2.first_column), @1.first_line, @1.first_column); }
    | expresion 'INCREMENTO' ptcoma
        { $$ = new Asignacion($1, new Aritmetica($1, '+', new Primitivo(1, 'int', @2.first_line, @2.first_column), @2.first_line, @2.first_column), @1.first_line, @1.first_column); }
    | expresion 'DECREMENTO' ptcoma
        { $$ = new Asignacion($1, new Aritmetica($1, '-', new Primitivo(1, 'int', @2.first_line, @2.first_column), @2.first_line, @2.first_column), @1.first_line, @1.first_column); }

    // Control de Flujo
    | 'R_IF' expresion bloque
        { $$ = new If($2, $3, null, @1.first_line, @1.first_column); }
    | 'R_IF' expresion bloque 'R_ELSE' bloque
        { $$ = new If($2, $3, $5, @1.first_line, @1.first_column); }
    | 'R_IF' expresion bloque 'R_ELSE' instruccion_if_else
        { $$ = new If($2, $3, $5, @1.first_line, @1.first_column); }
    | 'R_SWITCH' expresion 'LLAVE_IZQ' casos_switch 'LLAVE_DER'
        { $$ = new Switch($2, $4, @1.first_line, @1.first_column); }
    | bloque 
        { $$ = new Bloque($1, @1.first_line, @1.first_column); }

    // Ciclos
    | 'R_FOR' instruccion_for 'PTCOMA' expresion 'PTCOMA' expresion_for bloque 
        { $$ = new For($2, $4, $6, $7, @1.first_line, @1.first_column); }
    | 'R_FOR' expresion bloque 
        { $$ = new For(null, $2, null, $3, @1.first_line, @1.first_column); }
    | 'R_FOR' 'GUION_BAJO' 'COMA' IDENTIFICADOR 'DECL_CORTA' 'R_RANGE' expresion bloque
        { $$ = new ForRange(null, $4, $7, $8, @1.first_line, @1.first_column); }
    | 'R_FOR' IDENTIFICADOR 'COMA' IDENTIFICADOR 'DECL_CORTA' 'R_RANGE' expresion bloque
        { $$ = new ForRange($2, $4, $7, $8, @1.first_line, @1.first_column); }

    // Funciones y Structs
    | 'R_FUNC' IDENTIFICADOR 'PAR_IZQ' parametros 'PAR_DER' tipo_var bloque
        { $$ = new Funcion($2, $4, $6, $7, @1.first_line, @1.first_column); }
    | 'R_FUNC' IDENTIFICADOR 'PAR_IZQ' parametros 'PAR_DER' bloque
        { $$ = new Funcion($2, $4, "void", $6, @1.first_line, @1.first_column); }
    | 'R_STRUCT' IDENTIFICADOR 'LLAVE_IZQ' atributos_struct 'LLAVE_DER'
        { $$ = new StructDec($2, $4, @1.first_line, @1.first_column); }

    // Nativas y Transferencia
    | 'R_FMT' 'PUNTO' 'R_PRINTLN' 'PAR_IZQ' lista_expresiones 'PAR_DER' ptcoma
        { $$ = new Imprimir($5, true, @1.first_line, @1.first_column); }
    | 'R_FMT' 'PUNTO' 'R_PRINT' 'PAR_IZQ' lista_expresiones 'PAR_DER' ptcoma
        { $$ = new Imprimir($5, false, @1.first_line, @1.first_column); }
    | 'R_BREAK' ptcoma            { $$ = new Break(@1.first_line, @1.first_column); }
    | 'R_CONTINUE' ptcoma         { $$ = new Continue(@1.first_line, @1.first_column); }
    | 'R_RETURN' expresion ptcoma { $$ = new Return($2, @1.first_line, @1.first_column); }
    | 'R_RETURN' ptcoma           { $$ = new Return(null, @1.first_line, @1.first_column); }
    | expresion ptcoma            { $$ = $1; }
    ;

instruccion_if_else
    : 'R_IF' expresion bloque { $$ = new If($2, $3, null, @1.first_line, @1.first_column); }
    | 'R_IF' expresion bloque 'R_ELSE' bloque { $$ = new If($2, $3, $5, @1.first_line, @1.first_column); }
    | 'R_IF' expresion bloque 'R_ELSE' instruccion_if_else { $$ = new If($2, $3, $5, @1.first_line, @1.first_column); }
    ;

casos_switch
    : casos_switch caso { $1.push($2); $$ = $1; }
    | caso              { $$ = [$1]; }
    | /* vacio */       { $$ = []; }
    ;

caso
    : 'R_CASE' expresion 'DOS_PUNTOS' instrucciones { $$ = new Case($2, $4, @1.first_line, @1.first_column); }
    | 'R_DEFAULT' 'DOS_PUNTOS' instrucciones        { $$ = new Case(null, $3, @1.first_line, @1.first_column); }
    ;

bloque
    : 'LLAVE_IZQ' instrucciones 'LLAVE_DER' { $$ = $2; }
    | 'LLAVE_IZQ' 'LLAVE_DER'               { $$ = []; }
    ;

instruccion_for
    : 'R_VAR' IDENTIFICADOR tipo_var 'IGUAL' expresion { $$ = new Declaracion($2, $3, $5, @1.first_line, @1.first_column); }
    | IDENTIFICADOR 'DECL_CORTA' expresion { $$ = new Declaracion($1, null, $3, @1.first_line, @1.first_column); }
    | expresion 'IGUAL' expresion          { $$ = new Asignacion($1, $3, @1.first_line, @1.first_column); }
    | /* vacío */                          { $$ = null; }
    ;

expresion_for
    : expresion 'IGUAL' expresion      { $$ = new Asignacion($1, $3, @1.first_line, @1.first_column); }
    | expresion 'MAS_IGUAL' expresion  { $$ = new Asignacion($1, new Aritmetica($1, '+', $3, @2.first_line, @2.first_column), @1.first_line, @1.first_column); }
    | expresion 'INCREMENTO'           { $$ = new Asignacion($1, new Aritmetica($1, '+', new Primitivo(1, 'int', @2.first_line, @2.first_column), @2.first_line, @2.first_column), @1.first_line, @1.first_column); }
    | /* vacío */                      { $$ = null; }
    ;

parametros
    : lista_parametros { $$ = $1; }
    | /* vacío */      { $$ = []; }
    ;

lista_parametros
    : lista_parametros 'COMA' IDENTIFICADOR tipo_var { $1.push({id: $3, tipo: $4}); $$ = $1; }
    | IDENTIFICADOR tipo_var                         { $$ = [{id: $1, tipo: $2}]; }
    ;

// Estructura limpia (Solo "Tipo ID;")
atributos_struct
    : atributos_struct tipo_var IDENTIFICADOR ptcoma { $1.push({id: $3, tipo: $2}); $$ = $1; }
    | tipo_var IDENTIFICADOR ptcoma                  { $$ = [{id: $2, tipo: $1}]; }
    ;

lista_expresiones
    : lista_expresiones 'COMA' expresion { $1.push($3); $$ = $1; }
    | expresion                          { $$ = [$1]; }
    | /* vacío */                        { $$ = []; }
    ;

expresion
    : 'ENTERO'          { $$ = new Primitivo(parseInt($1), 'int', @1.first_line, @1.first_column); }
    | 'DECIMAL'         { $$ = new Primitivo(parseFloat($1), 'float64', @1.first_line, @1.first_column); }
    | 'CADENA'          { $$ = new Primitivo($1, 'string', @1.first_line, @1.first_column); }
    | 'CARACTER'        { $$ = new Primitivo($1, 'char', @1.first_line, @1.first_column); } 
    | 'R_TRUE'          { $$ = new Primitivo(true, 'bool', @1.first_line, @1.first_column); }
    | 'R_FALSE'         { $$ = new Primitivo(false, 'bool', @1.first_line, @1.first_column); }
    | 'R_NIL'           { $$ = new Primitivo(null, 'nil', @1.first_line, @1.first_column); }

    | expresion 'MAS' expresion      { $$ = new Aritmetica($1, '+', $3, @2.first_line, @2.first_column); }
    | expresion 'MENOS' expresion    { $$ = new Aritmetica($1, '-', $3, @2.first_line, @2.first_column); }
    | expresion 'POR' expresion      { $$ = new Aritmetica($1, '*', $3, @2.first_line, @2.first_column); }
    | expresion 'DIVIDIDO' expresion { $$ = new Aritmetica($1, '/', $3, @2.first_line, @2.first_column); }
    | expresion 'MODULO' expresion   { $$ = new Aritmetica($1, '%', $3, @2.first_line, @2.first_column); }
    | 'MENOS' expresion %prec UMENOS { $$ = new Aritmetica(new Primitivo(0, 'int', @1.first_line, @1.first_column), '-', $2, @1.first_line, @1.first_column); }

    | expresion 'IGUAL_IGUAL' expresion { $$ = new Relacional($1, '==', $3, @2.first_line, @2.first_column); }
    | expresion 'DIFERENTE' expresion   { $$ = new Relacional($1, '!=', $3, @2.first_line, @2.first_column); }
    | expresion 'MENOR' expresion       { $$ = new Relacional($1, '<', $3, @2.first_line, @2.first_column); }
    | expresion 'MAYOR' expresion       { $$ = new Relacional($1, '>', $3, @2.first_line, @2.first_column); }
    | expresion 'MENOR_IGUAL' expresion { $$ = new Relacional($1, '<=', $3, @2.first_line, @2.first_column); }
    | expresion 'MAYOR_IGUAL' expresion { $$ = new Relacional($1, '>=', $3, @2.first_line, @2.first_column); }

    | expresion 'AND' expresion { $$ = new Logica($1, '&&', $3, @2.first_line, @2.first_column); }
    | expresion 'OR' expresion  { $$ = new Logica($1, '||', $3, @2.first_line, @2.first_column); }
    | 'NOT' expresion           { $$ = new Logica(null, '!', $2, @1.first_line, @1.first_column); }

    | 'PAR_IZQ' expresion 'PAR_DER' { $$ = $2; }

    // --- ACCESOS ---
    | IDENTIFICADOR 
        { $$ = new AccesoVariable($1, @1.first_line, @1.first_column); }
    | expresion 'COR_IZQ' expresion 'COR_DER' 
        { $$ = new AccesoSlice($1, $3, @2.first_line, @2.first_column); }
    | expresion 'PUNTO' IDENTIFICADOR 
        { $$ = new AccesoStruct($1, $3, @2.first_line, @2.first_column); }

    // --- LLAMADAS A FUNCIONES ---
    | IDENTIFICADOR 'PAR_IZQ' lista_expresiones 'PAR_DER'
        { $$ = new LlamadaFunc($1, $3, @1.first_line, @1.first_column); }

    // --- FUNCIONES NATIVAS ---
    | 'R_LEN' 'PAR_IZQ' expresion 'PAR_DER'
        { $$ = new LlamadaNativa('len', [$3], @1.first_line, @1.first_column); }
    | 'R_APPEND' 'PAR_IZQ' expresion 'COMA' expresion 'PAR_DER'
        { $$ = new LlamadaNativa('append', [$3, $5], @1.first_line, @1.first_column); }
    | 'R_STRCONV' 'PUNTO' 'R_ATOI' 'PAR_IZQ' expresion 'PAR_DER'
        { $$ = new LlamadaNativa('atoi', [$5], @1.first_line, @1.first_column); }
    | 'R_STRCONV' 'PUNTO' 'R_PARSEFLOAT' 'PAR_IZQ' expresion 'PAR_DER'
        { $$ = new LlamadaNativa('parsefloat', [$5], @1.first_line, @1.first_column); }
    | 'R_REFLECT' 'PUNTO' 'R_TYPEOF' 'PAR_IZQ' expresion 'PAR_DER'
        { $$ = new LlamadaNativa('typeof', [$5], @1.first_line, @1.first_column); }
    
    | 'R_SLICES' 'PUNTO' 'R_INDEX' 'PAR_IZQ' expresion 'COMA' expresion 'PAR_DER'
        { $$ = new LlamadaNativa('index', [$5, $7], @1.first_line, @1.first_column); }
        
    | 'R_STRINGS' 'PUNTO' 'R_JOIN' 'PAR_IZQ' expresion 'COMA' expresion 'PAR_DER'
        { $$ = new LlamadaNativa('join', [$5, $7], @1.first_line, @1.first_column); }
    // --- INSTANCIACIONES (SLICES Y STRUCTS) ---
    
    // Slices (Sin coma al final)
    | 'COR_IZQ' 'COR_DER' tipo_var 'LLAVE_IZQ' lista_valores_arreglo 'LLAVE_DER'
        { $$ = new InstanciaSlice("[]" + $3, $5, @1.first_line, @1.first_column); }

    // Slices (CON coma al final - Trailing Comma)
    | 'COR_IZQ' 'COR_DER' tipo_var 'LLAVE_IZQ' lista_valores_arreglo 'COMA' 'LLAVE_DER'
        { $$ = new InstanciaSlice("[]" + $3, $5, @1.first_line, @1.first_column); }

    | 'LLAVE_IZQ' lista_atributos_instancia 'LLAVE_DER'
        { $$ = new InstanciaStruct($2, @1.first_line, @1.first_column); }

    | expresion 'PUNTO' IDENTIFICADOR
        { $$ = new AccesoStruct($1, $3, @2.first_line, @2.first_column); }
    ;

lista_atributos_instancia
    : lista_atributos_instancia 'COMA' IDENTIFICADOR 'DOS_PUNTOS' expresion 
        { $1.push({id: $3, valor: $5}); $$ = $1; }
    | IDENTIFICADOR 'DOS_PUNTOS' expresion 
        { $$ = [{id: $1, valor: $3}]; }
    | /* vacío para structs vacíos {} */
        { $$ = []; }
    ;

lista_valores_arreglo
    : lista_valores_arreglo 'COMA' valor_arreglo { $1.push($3); $$ = $1; }
    | valor_arreglo                              { $$ = [$1]; }
    | /* vacio */                                { $$ = []; }
    ;

valor_arreglo
    : expresion 
        { $$ = $1; }
    
    // Sub-arreglo (Sin coma al final)
    | 'LLAVE_IZQ' lista_valores_arreglo 'LLAVE_DER' 
        { $$ = new InstanciaSlice("interno", $2, @1.first_line, @1.first_column); }
    
    // Sub-arreglo (CON coma al final - Trailing Comma)
    | 'LLAVE_IZQ' lista_valores_arreglo 'COMA' 'LLAVE_DER' 
        { $$ = new InstanciaSlice("interno", $2, @1.first_line, @1.first_column); }
    ;