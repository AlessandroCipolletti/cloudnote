<div class="drawith-editor-tools__container">

  {{#each tools}}
    <div class="drawith-editor-tools__tool drawith-editor-tools__tool-{{this.name}} {{#if this.disabled}} disabled {{/if}}" data-tool="{{this.name}}"></div>
  {{/each}}

</div>

<div class="drawith-editor-tools__versions-container">

  {{#each tools}}
    {{#if this.versions}}
      <div class="drawith-editor-tools__versions drawith-editor-tools__versions-{{this.name}}">
        {{#each this.versions}}

        {{/each}}
      </div>
    {{/if}}
  {{/each}}

</div>
