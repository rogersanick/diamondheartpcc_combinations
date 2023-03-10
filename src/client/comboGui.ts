const createComboGui = (options: string[], callback: (e: Event) => void) => {
    const inputContainer = document.createElement("div")
    inputContainer.classList.add("input-selector")

    const select = document.createElement("select")
    select.id = "number-selector"

    const defaultOption = document.createElement("option")
    defaultOption.value = ""
    defaultOption.text = "Select a Combination"
    select.appendChild(defaultOption)
    select.onchange = callback

    for (let i = 0; i < options.length; i++) {
        const option = document.createElement("option")
        option.value = options[i]
        option.text = options[i]
        select.appendChild(option)
    }

    inputContainer.appendChild(select)
    document.body.appendChild(inputContainer)

    // CSS styles
    const inputSelectorStyles = `.input-selector select {
      position: absolute;
      bottom: 30px;
      left: 30px;
      max-width: 40vw;
      font-size: 2rem;
      padding: 10px 20px;
      border-radius: 5px;
      border: none;
      background-color: #f5f5f5;
      color: #555;
      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
    }
  
    .input-selector select:focus {
      outline: none;
      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
    }`

    const styleEl = document.createElement("style")
    styleEl.innerHTML = inputSelectorStyles
    document.head.appendChild(styleEl)
}

export { createComboGui }