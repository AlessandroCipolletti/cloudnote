<div class="drawith-editor-tools__container">

  {{#each tools}}
    <div class="drawith-editor-tools__tool drawith-editor-tools__tool-{{this.name}} {{#if this.disabled}} disabled {{/if}}" data-tool="{{this.name}}"></div>
  {{/each}}

</div>
