<div class="cloudnote-editor-tools__container">

  {{#each tools}}
    <div class="cloudnote-editor-tools__tool cloudnote-editor-tools__tool-{{this.name}} {{#if this.disabled}} disabled {{/if}}" data-tool="{{this.name}}"></div>
  {{/each}}

</div>
