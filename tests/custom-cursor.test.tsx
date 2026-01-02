import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, fireEvent, screen } from '@testing-library/react'
import { CustomCursor } from '@/components/custom-cursor'

describe('CustomCursor', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  const getCursorElements = (container: HTMLElement) => {
    // CustomCursor renders two divs as siblings with fixed positioning
    const allFixedDivs = Array.from(container.querySelectorAll('div')).filter(div => {
      const classes = div.className
      return classes.includes('fixed') && classes.includes('pointer-events-none')
    })
    return {
      cursorOuter: allFixedDivs[0],
      cursorInner: allFixedDivs[1]
    }
  }

  it('hides the custom cursor when hovering over button elements', () => {
    const { container } = render(
      <div>
        <CustomCursor />
        <button data-testid="test-button">Click me</button>
      </div>
    )

    const button = container.querySelector('[data-testid="test-button"]') as HTMLElement
    const { cursorOuter, cursorInner } = getCursorElements(container)

    // Initial state - cursor should be visible
    expect(cursorOuter.className).toContain('opacity-100')
    expect(cursorInner.className).toContain('opacity-100')

    // Hover over button
    fireEvent.mouseMove(button, { clientX: 100, clientY: 100 })

    // Cursor should now be hidden
    expect(cursorOuter.className).toContain('opacity-0')
    expect(cursorInner.className).toContain('opacity-0')
  })

  it('hides the custom cursor when hovering over anchor elements', () => {
    const { container } = render(
      <div>
        <CustomCursor />
        <a href="#" data-testid="test-link">Link</a>
      </div>
    )

    const link = container.querySelector('[data-testid="test-link"]') as HTMLElement
    const { cursorOuter, cursorInner } = getCursorElements(container)

    // Initial state - cursor should be visible
    expect(cursorOuter.className).toContain('opacity-100')
    expect(cursorInner.className).toContain('opacity-100')

    // Hover over link
    fireEvent.mouseMove(link, { clientX: 100, clientY: 100 })

    // Cursor should now be hidden
    expect(cursorOuter.className).toContain('opacity-0')
    expect(cursorInner.className).toContain('opacity-0')
  })

  it('hides the custom cursor when hovering over input elements', () => {
    const { container } = render(
      <div>
        <CustomCursor />
        <input type="text" data-testid="test-input" />
      </div>
    )

    const input = container.querySelector('[data-testid="test-input"]') as HTMLElement
    const { cursorOuter, cursorInner } = getCursorElements(container)

    // Initial state - cursor should be visible
    expect(cursorOuter.className).toContain('opacity-100')
    expect(cursorInner.className).toContain('opacity-100')

    // Hover over input
    fireEvent.mouseMove(input, { clientX: 100, clientY: 100 })

    // Cursor should now be hidden
    expect(cursorOuter.className).toContain('opacity-0')
    expect(cursorInner.className).toContain('opacity-0')
  })

  it('hides the custom cursor when hovering over select elements', () => {
    const { container } = render(
      <div>
        <CustomCursor />
        <select data-testid="test-select">
          <option>Option 1</option>
        </select>
      </div>
    )

    const select = container.querySelector('[data-testid="test-select"]') as HTMLElement
    const { cursorOuter, cursorInner } = getCursorElements(container)

    // Initial state - cursor should be visible
    expect(cursorOuter.className).toContain('opacity-100')
    expect(cursorInner.className).toContain('opacity-100')

    // Hover over select
    fireEvent.mouseMove(select, { clientX: 100, clientY: 100 })

    // Cursor should now be hidden
    expect(cursorOuter.className).toContain('opacity-0')
    expect(cursorInner.className).toContain('opacity-0')
  })

  it('hides the custom cursor when hovering over textarea elements', () => {
    const { container } = render(
      <div>
        <CustomCursor />
        <textarea data-testid="test-textarea" />
      </div>
    )

    const textarea = container.querySelector('[data-testid="test-textarea"]') as HTMLElement
    const { cursorOuter, cursorInner } = getCursorElements(container)

    // Initial state - cursor should be visible
    expect(cursorOuter.className).toContain('opacity-100')
    expect(cursorInner.className).toContain('opacity-100')

    // Hover over textarea
    fireEvent.mouseMove(textarea, { clientX: 100, clientY: 100 })

    // Cursor should now be hidden
    expect(cursorOuter.className).toContain('opacity-0')
    expect(cursorInner.className).toContain('opacity-0')
  })

  it('hides the custom cursor when hovering over elements with role="button"', () => {
    const { container } = render(
      <div>
        <CustomCursor />
        <div role="button" data-testid="test-role-button">Role Button</div>
      </div>
    )

    const roleButton = container.querySelector('[data-testid="test-role-button"]') as HTMLElement
    const { cursorOuter, cursorInner } = getCursorElements(container)

    // Initial state - cursor should be visible
    expect(cursorOuter.className).toContain('opacity-100')
    expect(cursorInner.className).toContain('opacity-100')

    // Hover over role button
    fireEvent.mouseMove(roleButton, { clientX: 100, clientY: 100 })

    // Cursor should now be hidden
    expect(cursorOuter.className).toContain('opacity-0')
    expect(cursorInner.className).toContain('opacity-0')
  })

  it('hides the custom cursor when hovering over elements with data-ui-panel attribute', () => {
    const { container } = render(
      <div>
        <CustomCursor />
        <div data-ui-panel data-testid="test-ui-panel">UI Panel</div>
      </div>
    )

    const uiPanel = container.querySelector('[data-testid="test-ui-panel"]') as HTMLElement
    const { cursorOuter, cursorInner } = getCursorElements(container)

    // Initial state - cursor should be visible
    expect(cursorOuter.className).toContain('opacity-100')
    expect(cursorInner.className).toContain('opacity-100')

    // Hover over UI panel
    fireEvent.mouseMove(uiPanel, { clientX: 100, clientY: 100 })

    // Cursor should now be hidden
    expect(cursorOuter.className).toContain('opacity-0')
    expect(cursorInner.className).toContain('opacity-0')
  })

  it('shows the custom cursor when hovering over non-UI elements', () => {
    const { container } = render(
      <div>
        <CustomCursor />
        <div data-testid="test-div">Regular div</div>
      </div>
    )

    const regularDiv = container.querySelector('[data-testid="test-div"]') as HTMLElement
    const { cursorOuter, cursorInner } = getCursorElements(container)

    // Hover over regular div
    fireEvent.mouseMove(regularDiv, { clientX: 100, clientY: 100 })

    // Cursor should remain visible
    expect(cursorOuter.className).toContain('opacity-100')
    expect(cursorInner.className).toContain('opacity-100')
  })

  it('hides the custom cursor when hovering over nested button inside a div', () => {
    const { container } = render(
      <div>
        <CustomCursor />
        <div data-testid="test-container">
          <button data-testid="test-nested-button">Nested Button</button>
        </div>
      </div>
    )

    const nestedButton = container.querySelector('[data-testid="test-nested-button"]') as HTMLElement
    const { cursorOuter, cursorInner } = getCursorElements(container)

    // Initial state - cursor should be visible
    expect(cursorOuter.className).toContain('opacity-100')
    expect(cursorInner.className).toContain('opacity-100')

    // Hover over nested button
    fireEvent.mouseMove(nestedButton, { clientX: 100, clientY: 100 })

    // Cursor should now be hidden
    expect(cursorOuter.className).toContain('opacity-0')
    expect(cursorInner.className).toContain('opacity-0')
  })
})
