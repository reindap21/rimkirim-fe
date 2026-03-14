import { describe, it, expect } from 'vitest'
import { firstCapital, wordCapital, toCamelCase, camelToTitleCase } from '~/utils/string'

describe('firstCapital', () => {
  it('returns "" for empty string', () => {
    expect(firstCapital('')).toBe('')
  })

  it('returns "" for null cast as string', () => {
    expect(firstCapital(null as unknown as string)).toBe('')
  })

  it('returns "" for number cast as string', () => {
    expect(firstCapital(123 as unknown as string)).toBe('')
  })

  it('returns "" for whitespace-only string', () => {
    expect(firstCapital('   ')).toBe('')
  })

  it('keeps already-capitalized string unchanged', () => {
    expect(firstCapital('Hello')).toBe('Hello')
  })

  it('capitalizes a lowercase string', () => {
    expect(firstCapital('hello')).toBe('Hello')
  })

  it('capitalizes a single character', () => {
    expect(firstCapital('h')).toBe('H')
  })

  it('capitalizes only the first char of a multi-word string', () => {
    expect(firstCapital('hello world')).toBe('Hello world')
  })

  it('trims leading/trailing whitespace before capitalizing', () => {
    expect(firstCapital('  hello  ')).toBe('Hello')
  })
})

describe('wordCapital', () => {
  it('returns "" for empty string', () => {
    expect(wordCapital('')).toBe('')
  })

  it('returns "" for null cast as string', () => {
    expect(wordCapital(null as unknown as string)).toBe('')
  })

  it('capitalizes a single word', () => {
    expect(wordCapital('hello')).toBe('Hello')
  })

  it('capitalizes two words', () => {
    expect(wordCapital('hello world')).toBe('Hello World')
  })

  it('filters double spaces (join uses separator string branch)', () => {
    expect(wordCapital('hello  world')).toBe('Hello World')
  })

  it('uses a custom string separator (join falls back to separator branch)', () => {
    expect(wordCapital('hello-world', '-')).toBe('Hello-World')
  })

  it('uses a regex separator (join falls back to " " branch)', () => {
    expect(wordCapital('hello world', /\s+/)).toBe('Hello World')
  })

  it('uses a custom string join overriding string separator (join is string branch)', () => {
    expect(wordCapital('hello world', ' ', '-')).toBe('Hello-World')
  })

  it('uses a custom string join overriding regex separator (join is string branch)', () => {
    expect(wordCapital('hello world', /\s+/, '-')).toBe('Hello-World')
  })

  it('falls back to " " when both join and separator are RegExp', () => {
    expect(wordCapital('hello world', /\s+/, /x/ as unknown as string)).toBe('Hello World')
  })

  it('handles leading whitespace', () => {
    expect(wordCapital('  hello world')).toBe('Hello World')
  })
})

describe('toCamelCase', () => {
  it('returns "" for empty string', () => {
    expect(toCamelCase('')).toBe('')
  })

  it('returns "" for null cast as string', () => {
    expect(toCamelCase(null as unknown as string)).toBe('')
  })

  it('returns "" for number cast as string', () => {
    expect(toCamelCase(123 as unknown as string)).toBe('')
  })

  it('lowercases a single word', () => {
    expect(toCamelCase('Hello')).toBe('hello')
  })

  it('camelCases two words', () => {
    expect(toCamelCase('hello world')).toBe('helloWorld')
  })

  it('camelCases multiple words', () => {
    expect(toCamelCase('Letter of Acceptance')).toBe('letterOfAcceptance')
  })

  it('lowercases each word before capitalizing (mixed case)', () => {
    expect(toCamelCase('mixed CASE words')).toBe('mixedCaseWords')
  })

  it('handles multiple consecutive spaces', () => {
    expect(toCamelCase('hello  world')).toBe('helloWorld')
  })

  it('handles leading and trailing whitespace', () => {
    expect(toCamelCase('  hello world  ')).toBe('helloWorld')
  })
})

describe('camelToTitleCase', () => {
  it('returns "" for empty string', () => {
    expect(camelToTitleCase('')).toBe('')
  })

  it('returns "" for null cast as string', () => {
    expect(camelToTitleCase(null as unknown as string)).toBe('')
  })

  it('capitalizes a single lowercase word', () => {
    expect(camelToTitleCase('hello')).toBe('Hello')
  })

  it('splits two-word camelCase', () => {
    expect(camelToTitleCase('helloWorld')).toBe('Hello World')
  })

  it('splits three-word camelCase', () => {
    expect(camelToTitleCase('letterOfAcceptance')).toBe('Letter Of Acceptance')
  })

  it('splits consecutive uppercase letters into individual title words', () => {
    // "helloHTML" → ["hello", "H", "T", "M", "L"] → "Hello H T M L"
    expect(camelToTitleCase('helloHTML')).toBe('Hello H T M L')
  })

  it('handles a string that starts with an uppercase letter', () => {
    expect(camelToTitleCase('HelloWorld')).toBe('Hello World')
  })

  it('handles a single character', () => {
    expect(camelToTitleCase('h')).toBe('H')
  })
})
