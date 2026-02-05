import { describe, it, expect, vi } from 'vitest'
import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import FileUploader from './FileUploader'


describe('FileUploader Component', () => {
  //component renders
  it('renders', () => {
    const { container } = render(<FileUploader />)
    expect(container).toBeTruthy()
    expect(container.querySelector('input[type="file"]')).toBeTruthy()
  })

  //file input is accessible
  it('has file input', async () => {
    render(<FileUploader />)
    
    const input = document.querySelector('input[type="file"]')
    expect(input).toBeTruthy()
    expect(input?.getAttribute('type')).toBe('file')
  })

  //submit button exists
  it('has submit button', async () => {
    render(<FileUploader />)
    
    const button = screen.queryByRole('button') || screen.queryByText(/submit|upload|send/i)
    expect(button).toBeTruthy()
  })

  //allows multiple files
  it('select multiple files', async () => {
    render(<FileUploader />)
    
    const input = document.querySelector('input[type="file"]')
    expect(input).toBeTruthy()
    expect(input?.hasAttribute('multiple')).toBe(true)
  })
})
