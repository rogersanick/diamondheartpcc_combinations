const addLoadingIndicator = () => {
    const css = ".dot-elastic{position:absolute;top:0;bottom:0;left:0;right:0;margin:auto;width:10px;height:10px;border-radius:5px;background-color:#294db4;color:#294db4;-webkit-animation:dot-elastic 1s infinite linear;animation:dot-elastic 1s infinite linear}.dot-elastic::before,.dot-elastic::after{content:\"\";display:inline-block;position:absolute;top:0}.dot-elastic::before{left:-15px;width:10px;height:10px;border-radius:5px;background-color:#294db4;color:#294db4;-webkit-animation:dot-elastic-before 1s infinite linear;animation:dot-elastic-before 1s infinite linear}.dot-elastic::after{left:15px;width:10px;height:10px;border-radius:5px;background-color:#294db4;color:#294db4;-webkit-animation:dot-elastic-after 1s infinite linear;animation:dot-elastic-after 1s infinite linear}@-webkit-keyframes dot-elastic-before{0%{transform:scale(1, 1)}25%{transform:scale(1, 1.5)}50%{transform:scale(1, 0.67)}75%{transform:scale(1, 1)}100%{transform:scale(1, 1)}}@keyframes dot-elastic-before{0%{transform:scale(1, 1)}25%{transform:scale(1, 1.5)}50%{transform:scale(1, 0.67)}75%{transform:scale(1, 1)}100%{transform:scale(1, 1)}}@-webkit-keyframes dot-elastic{0%{transform:scale(1, 1)}25%{transform:scale(1, 1)}50%{transform:scale(1, 1.5)}75%{transform:scale(1, 1)}100%{transform:scale(1, 1)}}@keyframes dot-elastic{0%{transform:scale(1, 1)}25%{transform:scale(1, 1)}50%{transform:scale(1, 1.5)}75%{transform:scale(1, 1)}100%{transform:scale(1, 1)}}@-webkit-keyframes dot-elastic-after{0%{transform:scale(1, 1)}25%{transform:scale(1, 1)}50%{transform:scale(1, 0.67)}75%{transform:scale(1, 1.5)}100%{transform:scale(1, 1)}}@keyframes dot-elastic-after{0%{transform:scale(1, 1)}25%{transform:scale(1, 1)}50%{transform:scale(1, 0.67)}75%{transform:scale(1, 1.5)}100%{transform:scale(1, 1)}}"
    function addcss(css: string){
        const head = document.getElementsByTagName("head")[0]
        const s = document.createElement("style")
        s.setAttribute("type", "text/css")
        s.appendChild(document.createTextNode(css))
        head.appendChild(s)
    }
    addcss(css)
    const loader = document.createElement("div")
    loader.classList.add("dot-elastic")
    document.body.appendChild(loader)
}

const removeLoadingIndicator = () => {
    const loader = document.getElementsByClassName("dot-elastic")[0]
    loader.remove()
} 

export { addLoadingIndicator, removeLoadingIndicator }