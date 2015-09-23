macro def__template {
  case { _ $name:lit $html:lit } => {
    var stx = #{$name},
        tagName = stx[0].token.value,
        protoName = makeIdent(tagName.camelize() + 'Prototype', #{$name});
    
    letstx $protoName = [protoName];

    return #{
      Object.defineProperty($protoName, 'template', {
        get: function() {
          var fragment = document.createDocumentFragment();
          var div = fragment.appendChild(document.createElement('div'));
          div.innerHTML = $html;
          while (child = div.firstChild) {
            fragment.insertBefore(child, div);
          }
          fragment.removeChild(div);
          return { content: fragment }
        }
      });
    }
  }
}
