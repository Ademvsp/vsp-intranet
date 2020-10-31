import React, { useRef, useState } from 'react';
import { StyledCkEditorContainer } from './styled-components';
import CKEditor from '@ckeditor/ckeditor5-react';
import UploadAdapter from '../../utils/upload-adapter';
import BalloonEditor from '@ckeditor/ckeditor5-build-balloon';

const BalloonEditorWrapper = (props) => {
	const {
		value,
		setValue,
		setUploading,
		loading,
		minHeight,
		maxHeight,
		borderChange,
		setTouched,
		placeholder
	} = props;
	const [focus, setFocus] = useState(false);
	const [hover, setHover] = useState(false);
	const editorRef = useRef();
	return (
		<StyledCkEditorContainer
			onFocus={() => setFocus(true)}
			onBlur={() => {
				setTouched();
				setFocus(false);
			}}
			onMouseEnter={() => setHover(true)}
			onMouseLeave={() => setHover(false)}
			onClick={() => editorRef.current.editor.editing.view.focus()}
			loading={loading}
			minHeight={minHeight}
			maxHeight={maxHeight}
			focus={focus}
			hover={hover}
			borderChange={borderChange}
		>
			<CKEditor
				ref={editorRef}
				editor={BalloonEditor}
				data={value}
				onChange={(_event, editor) => {
					const newUploading = editor
						.getData()
						.includes('<figure class="image"><img></figure>');
					setUploading(newUploading);
					setValue(editor.getData());
				}}
				disabled={loading}
				config={{
					placeholder: placeholder,
					toolbar: {
						items: [
							'heading',
							'bold',
							'italic',
							'numberedList',
							'bulletedList',
							'indent',
							'outdent',
							'blockQuote',
							'insertTable',
							'tableColumn',
							'tableRow',
							'mergeTableCells',
							'link',
							'imageUpload'
						],
						shouldNotGroupWhenFull: true
					},
					extraPlugins: [
						function MyCustomUploadAdapterPlugin(editor) {
							const plugin = 'FileRepository';
							editor.plugins.get(plugin).createUploadAdapter = (loader) =>
								new UploadAdapter(loader, 'posts');
						}
					],
					removePlugins: ['MediaEmbed']
				}}
			/>
		</StyledCkEditorContainer>
	);
};

export default BalloonEditorWrapper;
