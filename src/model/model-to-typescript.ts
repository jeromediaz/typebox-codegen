/*--------------------------------------------------------------------------

@sinclair/typebox-codegen

The MIT License (MIT)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

---------------------------------------------------------------------------*/

import { TypeBoxModel } from './model'
import { Formatter, PropertyEncoder } from '../common/index'
import { TypeCompiler } from '@sinclair/typebox/compiler'
import * as Types from '@sinclair/typebox'

export namespace ModelToTypeScript {
  function Any(schema: Types.TAny) {
    return 'any'
  }
  function Array(schema: Types.TArray) {
    const items = Visit(schema.items)
    return `Array<${items}>`
  }
  function Boolean(schema: Types.TBoolean) {
    return 'boolean'
  }
  function BigInt(schema: Types.TBigInt) {
    return 'bigint'
  }
  function Constructor(schema: Types.TConstructor) {
    const params = schema.parameters.map((param, i) => `param${i}: ${Visit(param)}`).join(', ')
    const returns = Visit(schema.returns)
    return `(new (${params}) => ${returns})`
  }
  function Date(schema: Types.TDate) {
    return 'Date'
  }
  function Function(schema: Types.TFunction) {
    const params = schema.parameters.map((param, i) => `param${i}: ${Visit(param)}`).join(', ')
    const returns = Visit(schema.returns)
    return `((${params}) => ${returns})`
  }
  function Integer(schema: Types.TInteger) {
    return 'number'
  }
  function Intersect(schema: Types.TIntersect) {
    return `(${schema.allOf.map((schema) => Visit(schema)).join(' & ')})`
  }
  function Literal(schema: Types.TLiteral) {
    if (typeof schema.const === 'string') {
      return `'${schema.const}'`
    } else {
      return `${schema.const}`
    }
  }
  function Never(schema: Types.TNever) {
    return 'never'
  }
  function Null(schema: Types.TNull) {
    return 'null'
  }
  function String(schema: Types.TString) {
    return 'string'
  }
  function Number(schema: Types.TNumber) {
    return 'number'
  }
  // prettier-ignore
  function Object(schema: Types.TObject) {
    const properties: string = globalThis.Object.entries(schema.properties).map(([key, property]) => {
      const optional = Types.TypeGuard.IsOptional(property)
      const readonly = Types.TypeGuard.IsReadonly(property)
      return (
        (optional && readonly) ? `readonly ${key}?: ${Visit(property)}` :
        readonly ? `readonly ${key}: ${Visit(property)}` :
        optional ? `${key}?: ${Visit(property)}` :
        `${PropertyEncoder.Encode(key)}: ${Visit(property)}`
      )
    }).join(',\n')
    return `{\n${properties}\n}`
  }
  function Promise(schema: Types.TPromise) {
    const item = Visit(schema.item)
    return `Promise<${item}>`
  }
  function Record(schema: Types.TRecord) {
    for (const [key, value] of globalThis.Object.entries(schema.patternProperties)) {
      const type = Visit(value)
      if (key === '^(0|[1-9][0-9]*)$') {
        return `Record<number, ${type}>`
      } else {
        return `Record<string, ${type}>`
      }
    }
    throw Error('TypeBoxToTypeScript: Unreachable')
  }
  function Ref(schema: Types.TRef) {
    return schema.$ref
  }
  function This(schema: Types.TThis) {
    return schema.$ref
  }
  function Tuple(schema: Types.TTuple) {
    if (schema.items === undefined) return `[]`
    const items = schema.items.map((schema) => Visit(schema)).join(', ')
    return `[${items}]`
  }
  function UInt8Array(schema: Types.TUint8Array) {
    return `Uint8Array`
  }
  function Undefined(schema: Types.TUndefined) {
    return `undefined`
  }
  function Union(schema: Types.TUnion) {
    return `(${schema.anyOf.map((schema) => Visit(schema)).join(' | ')})`
  }
  function Unknown(schema: Types.TUnknown) {
    return `unknown`
  }
  function Void(schema: Types.TVoid) {
    return `void`
  }
  function Enum(schema: Types.TEnum) {
    return schema.enum.map((value: string) => `'${value}'`).join(' | ');
  }
  function IsUnsafeDate(schema: Types.TSchema) {
    return schema.type === 'string' && ['date', 'date-time'].indexOf(schema.format) !== -1;
  }
  function IsEnum(schema: Types.TSchema) {
    return (schema.type === 'string' && global.Array.isArray(schema.enum))
  }
  function Visit(schema: Types.TSchema): string {
    if (reference_map.has(schema.$id!)) return schema.$id!
    if (schema.$id !== undefined) reference_map.set(schema.$id, schema)
    if (Types.TypeGuard.IsAny(schema)) return Any(schema)
    if (Types.TypeGuard.IsArray(schema)) return Array(schema)
    if (Types.TypeGuard.IsBoolean(schema)) return Boolean(schema)
    if (Types.TypeGuard.IsBigInt(schema)) return BigInt(schema)
    if (Types.TypeGuard.IsConstructor(schema)) return Constructor(schema)
    if (Types.TypeGuard.IsDate(schema)) return Date(schema)
    if (Types.TypeGuard.IsFunction(schema)) return Function(schema)
    if (Types.TypeGuard.IsInteger(schema)) return Integer(schema)
    if (Types.TypeGuard.IsIntersect(schema)) return Intersect(schema)
    if (Types.TypeGuard.IsLiteral(schema)) return Literal(schema)
    if (Types.TypeGuard.IsNever(schema)) return Never(schema)
    if (Types.TypeGuard.IsNull(schema)) return Null(schema)
    if (Types.TypeGuard.IsNumber(schema)) return Number(schema)
    if (Types.TypeGuard.IsObject(schema)) return Object(schema)
    if (Types.TypeGuard.IsPromise(schema)) return Promise(schema)
    if (Types.TypeGuard.IsRecord(schema)) return Record(schema)
    if (Types.TypeGuard.IsRef(schema)) return Ref(schema)
    if (Types.TypeGuard.IsThis(schema)) return This(schema)
    if (Types.TypeGuard.IsString(schema)) return String(schema)
    if (Types.TypeGuard.IsTuple(schema)) return Tuple(schema)
    if (Types.TypeGuard.IsUint8Array(schema)) return UInt8Array(schema)
    if (Types.TypeGuard.IsUndefined(schema)) return Undefined(schema)
    if (Types.TypeGuard.IsUnion(schema)) return Union(schema)
    if (Types.TypeGuard.IsUnknown(schema)) return Unknown(schema)
    if (Types.TypeGuard.IsVoid(schema)) return Void(schema)
    if (IsUnsafeDate(schema)) return String(schema as Types.TString);
    if (IsEnum(schema)) return Enum(schema as Types.TEnum);

    return 'unknown'
  }
  export function GenerateType(model: TypeBoxModel, $id: string) {
    reference_map.clear()
    const type = model.types.find((type) => type.$id === $id)
    if (type === undefined) return `export type ${$id} = unknown`
    return `export type ${type.$id!} = ${Visit(type)}`
  }
  const reference_map = new Map<string, Types.TSchema>()
  export function Generate(model: TypeBoxModel): string {
    reference_map.clear()
    const definitions: string[] = []
    for (const type of model.types) {
      const definition = `export type ${type.$id!} = ${Visit(type)}`
      //const assertion = `export const ${type.$id!} = (() => { ${TypeCompiler.Code(type, model.types, { language: 'typescript' })} })();`
      //const rewritten = assertion.replaceAll(`return function check(value: any): boolean`, `return function check(value: any): value is ${type.$id!}`)
      definitions.push(`
      ${definition}
      `)
    }
    const output = [...definitions]
    return Formatter.Format(output.join('\n\n'))
  }
}
