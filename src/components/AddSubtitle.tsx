import { Dialog, Transition } from '@headlessui/react';
import { Button, IconPlus, IconX } from '@supabase/ui';
import Image from 'next/image';
import { Fragment, useCallback, useState } from 'react';
import { SearchSubtitle } from 'src/components/SearchSubtitle';
import type { Title } from 'src/components/TitleList';
import { client } from 'src/lib/supabase';

type Props = {
  title: Title;
  uuid: string;
  getSubtitleList: VoidFunction;
};

export const AddSubtitle = (props: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const [volume, setVolume] = useState('');
  const [isbn, setIsbn] = useState('');
  const [possession, setPossession] = useState(false);

  const openModal = useCallback(() => setIsOpen(true), []);
  const closeModal = useCallback(() => {
    setIsOpen(false)
    setVolume('');
    setIsbn('');
    setPossession(false);
  }, []);
  const handleAdd = useCallback(async () => {
    const v = parseInt(volume, 10);
    if (volume === '' || isNaN(v) || v < 0) {
      alert('Input volume as an integer.');
      return;
    }
    if (isbn === '') {
      alert('Input ISBN number.');
      return;
    }
    const res = await fetch(`https://api.openbd.jp/v1/get?isbn=${isbn}`);
    const openbd = await res.json();
    if (!openbd[0]) {
      alert('Invalid ISBN number.');
      return;
    }
    const imageUrl = `https://cover.openbd.jp/${isbn}.jpg`;
    const { data, error } = await client.from('manga_subtitle').insert([{
      user_id: props.uuid,
      title_id: props.title.id,
      volume: v,
      isbn: isbn.replaceAll('-', ''),
      image_url: imageUrl,
      possession,
    }]);
    if (error) {
      alert('Failed: Add Subtitle.');
    } else {
      if (data) {
        props.getSubtitleList();
        closeModal();
      }
    }
  }, [closeModal, isbn, possession, props, volume])

  return (
    <>
      <div className='p-2 border cursor-pointer' onClick={openModal}>
        + Add
      </div>
      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as='div' className='fixed inset-0 z-10 overflow-y-auto' onClose={closeModal}>
          <div className='min-h-screen px-4 text-center border-2'>
            <span className='inline-block  h-screen align-middle' aria-hidden='true'>&#8203</span>
            <Transition.Child
              as={Fragment}
              enter='ease-out duration-300'
              enterFrom='opacity-0 scale-95'
              enterTo='opacity-100 scale-100'
              leave='ease-in duration-200'
              leaveFrom='opacity-100 scale-100'
              leaveTo='opacity-0 scale-95'
            >
              <div className='inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform border border-gray-300 shadow-xl bg-gray-50 rounded-xl'>
                <Dialog.Title as='h3' className='text-2xl font-medium leading-6 text-center text-gray-900'>
                  Add Subtitle
                </Dialog.Title>
                <div className='grid grid-cols-4 gap-2 mt-4'>
                  <div className='col-span-1 pt-1 text-xl text-center'>
                    Volume
                  </div>
                  <input className='w-full h-10 col-span-3 p-2 bg-white border border-gray-300 rounded shadow appearance-none hover:border-gray-700' value={volume} onChange={(e) => setVolume(e.target.value)}/>
                </div>
                <div className='grid grid-cols-4 gap-2 mt-4'>
                  <div className='col-span-1 pt-1 text-xl text-center'>
                    ISBN
                  </div>
                  <input className='w-full h-10 col-span-3 p-2 bg-white border border-gray-300 rounded shadow appearance-none hover:border-gray-700' value={isbn} onChange={(e) => setIsbn(e.target.value)}/>
                </div>
                <SearchSubtitle title={props.title} setIsbn={setIsbn} />
                <div className='grid grid-cols-5 gap-2 mt-4'>
                  <div className='col-span-2 pt-1 text-xl text-center'>
                    Possession
                  </div>
                  <div className='col-span-3 pt-2 pl-2'>
                    <input type='checkbox' className='scale-150' checked={possession} onChange={() => setPossession(!possession)}/>
                  </div>
                </div>
                <div className='flex justify-center mt-4'>
                  <div className='w-32 p-2'>
                    <Button block type='default' size='large' icon={<IconX/>} onClick={closeModal}>
                      Cancel
                    </Button>
                  </div>
                  <div className='w-32 p-2'>
                    <Button block size='large' icon={<IconPlus/>} onClick={handleAdd}>
                      Add
                    </Button>
                  </div>
                </div>
              </div>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>
    </>
  );
};
