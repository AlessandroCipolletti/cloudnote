<div class="drawith-folder__drawing drawith-folder__drawing-new"></div>

{{#each drawings}}
  <div class="drawith-folder__drawing" data-id="{{this.id}}" style="background: url('{{this.localPathSmall}}') no-repeat center , url('img/paper/white.png'); background-size: 90%, auto;"></div>
{{/each}}
