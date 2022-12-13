<div class="{{$viewClass['form-group']}} {!! !$errors->has($column) ?: 'has-error' !!}">
	<label for="{{$id}}" class="{{$viewClass['label']}} control-label">{{$label}}</label>
	<div class="{{$viewClass['field']}}">
		@include('admin::form.error')
		<div class="controls" id="aetherupload-wrapper-{{$id}}">
			<input type="file" id="{{$id}}-resource" data-filename-placement="inside" placeholder="{{ old($column, $value) }}" class="file-inputs"/>
			<div class="progress " style="height: 10px;margin-bottom: 2px;margin-top: 10px;width: 200px;">
				<div id="{{$id}}-progressbar" style="background:lightseagreen;height:10px;width:0;"></div>
			</div>
			<span style="font-size:12px;color:#aaa;" id="{{$id}}-output"></span>

			<input type="hidden" name="{{$name}}" id="{{$id}}-savedpath" value="{{ old($column, $value) }}">

		</div>
		@include('admin::form.help-block')
	</div>
</div>

