import { HocuspocusProvider } from '@hocuspocus/provider';
import { withYHistory, withYjs, YjsEditor } from '@slate-yjs/core';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { createEditor, Descendant } from 'slate';
import { Editable, Slate, withReact } from 'slate-react';
import * as Y from 'yjs';
import { ConnectionToggle } from '../components/ConnectionToggle/ConnectionToggle';
import { Element } from '../components/Element/Element';
import { Leaf } from '../components/Leaf';
import { withMarkdown } from '../plugins/withMarkdown';

export function Simple() {
  const [value, setValue] = useState<Descendant[]>([]);
  const [connected, setConnected] = useState(false);

  const provider = useMemo(
    () =>
      new HocuspocusProvider({
        url: 'ws://127.0.0.1:1234',
        name: 'slate-yjs-demo',
        onConnect: () => setConnected(true),
        onDisconnect: () => setConnected(false),
      }),
    []
  );

  const toggleConnection = useCallback(() => {
    if (connected) {
      return provider.disconnect();
    }

    provider.connect();
  }, [provider, connected]);

  const editor = useMemo(() => {
    const sharedType = provider.document.get('content', Y.XmlText) as Y.XmlText;

    return withMarkdown(
      withReact(withYHistory(withYjs(createEditor(), sharedType)))
    );
  }, [provider.document]);

  // Disconnect YjsEditor on unmount in order to free up resources
  useEffect(() => () => YjsEditor.disconnect(editor), [editor]);
  useEffect(() => () => provider.disconnect(), [provider]);

  return (
    <div className="flex justify-center">
      <Slate value={value} onChange={setValue} editor={editor}>
        <Editable
          className="py-32 max-w-4xl w-full mx-10 flex-col"
          renderElement={Element}
          renderLeaf={Leaf}
          placeholder="Write something ..."
        />
      </Slate>
      <ConnectionToggle connected={connected} onClick={toggleConnection} />
    </div>
  );
}