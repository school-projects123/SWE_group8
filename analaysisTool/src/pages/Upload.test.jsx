import { describe, it, expect } from 'vitest'
import React from 'react'
import { render, screen } from '@testing-library/react'
import Upload from './Upload'


describe('Upload Page', () => {
  //page renders with content
  it('renders', () => {
    const { container } = render(<Upload />)
    expect(container.innerHTML.length > 0).toBeTruthy()
  })

  //FileUploader is present
  it('has FileUploader', () => {
    render(<Upload />)
    
    const fileInput = document.querySelector('input[type="file"]')
    const submitBtn = screen.queryByRole('button') || screen.queryByText(/submit|upload/i)
    expect(fileInput && submitBtn).toBeTruthy()
  })
})
