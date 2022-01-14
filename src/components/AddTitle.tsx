import { Dialog, Transition } from '@headlessui/react';
import { Button, IconPlus, IconX } from '@supabase/ui';

import { Fragment, useCallback, useState } from 'react';
import { client } from 'src/lib/supabase';

type Props = {
  uuid: string;
  getTitleList: VoidFunction;
};

export const AddTitle = (props: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");

  const openModal = useCallback(() => {
    setIsOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setTitle("");
    setAuthor("");
    setIsOpen(false);
  }, []);

  const handleAdd = useCallback(async (uuid: string) => {
    if (title === "") {
      alert("Input Title.");
      return;
    }
    const { data, error } = await client.from("manga_title").insert([{ user_id: uuid, title, author }]);
    if (error) {
      alert("Failed: Add TItle.");
    } else {
      if (data) {
        props.getTitleList();
        closeModal();
      }
    }
  }, [author, closeModal, props, title]);

  return (
    <>
      <div className="p-2 border cursor-pointer" onClick={openModal}>
        <div className="flex justify-center">
          <div className="mt-2 text-center">+ADD NEW</div>
        </div>
      </div>
      <Transition appear  show={isOpen} as={Fragment}>
        <Dialog as="div" className="fixed inset-0 z-10 overflow-y-auto" onClose={closeModal}>
          <div className="min-h-screen px-4 text-center border-2">
            <span className="inline-block h-screen align-middle" aria-hidden="true">
              &#8203;
            </span>
            <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-100" leaveTo="opacity-0 scale-95">
              <div className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform border border-gray-300 shadow-x1 bg-gray-50 rounded-x1">
                <Dialog.Title as="h3" className="text-2xl font-medium leading-6 text-center text-gray-900">
                  Add Title
                </Dialog.Title>
                <div className="grid grid-cols-4 gap2 mt-4">
                  <div className="col-span-1 text-xl text-center">
                    Title
                  </div>
                  <input className="w-full h-10 col-span-3 p-2 bg-white border border-gray-300 rounded shadow appearance-none hover:border-gray-700" value={title} onChange={(e) => setTitle(e.target.value)}/>
                </div>
                <div className="grid grid-cols-4 gap2 mt-4">
                  <div className="col-span-1 text-xl text-center">
                    Author
                  </div>
                  <input className="w-full h-10 col-span-3 p-2 bg-white border border-gray-300 rounded shadow appearance-none hover:border-gray-700" value={author} onChange={(e) => setAuthor(e.target.value)}/>
                </div>
                <div className="flex justify-center mt-4">
                  <div className="w-32 p-2">
                    <Button block type="default" size="large" icon={<IconX/>} onClick={closeModal}>Cancel</Button>
                  </div>
                  <div className="w-32 p-2">
                    <Button block size="large" icon={<IconPlus/>} onClick={() => handleAdd(props.uuid)}>Add</Button>
                  </div>
                </div>
              </div>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>
    </>
  )
}
