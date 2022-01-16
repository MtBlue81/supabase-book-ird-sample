import { Dialog, Transition } from '@headlessui/react';
import {Button, IconSave, IconX } from '@supabase/ui';
import { Fragment, useCallback, useEffect, useRef, useState } from 'react';
import Avatar from 'react-avatar';
import { client, getProfile } from 'src/lib/supabase';
import type { User } from '@supabase/supabase-js';

type Props = {
  user: User | null;
};

export const EditProfile = (props: Props) => {
  const [id, setId] = useState<number | null>(null);
  const [uid, setUid] = useState('');
  const [name, setName] = useState('User');
  const [editName, setEditName] = useState('User');
  const [iconExists, setIconExists] = useState(false);
  const [icon, setIcon] = useState<string | null>(null);
  const [previewIcon, setPreviewIcon] = useState<string | null>(null);
  const [previewIconFile, setPreviewIconFile] = useState<File | null>(null);
  const iconInputRef = useRef<HTMLInputElement>(null);

  const getUserInfo = useCallback(async () => {
    const userInfo = await getProfile();
    if (userInfo) {
      setId(userInfo.id);
      setName(userInfo.name);
      setEditName(userInfo.name);
      setIconExists(userInfo.icon);
      if (uid && userInfo.icon) {
        const { error, signedURL } = await client.storage.from('avatar').createSignedUrl(`private/${uid}.jpg`, 600);
        if (!error) {
          setIcon(signedURL);
          setPreviewIcon(signedURL);
        }
      }
    }
  }, [uid]);

  useEffect(() => {
    if (props.user) {
      setUid(props.user.id);
    }
  }, [props.user])

  useEffect(() => {
    getUserInfo();
  }, [getUserInfo]);

  const [isOpen, setIsOpen] = useState(false);

  const openModal = useCallback(() => setIsOpen(true), []);
  const closeModal = useCallback(() => setIsOpen(false), []);

  const handleSave = useCallback(async () => {
    if (editName === '') {
      alert('input name');
      return;
    }
    let iconChanged = false;
    if (previewIconFile) {
      const { error } = await client.storage.from('avatar').upload(`private/${uid}.jpg`, previewIconFile, { upsert: true });
      if (error) {
        alert('Failed: Upload Icon.');
      } else {
        iconChanged = true;
      }
    }
    if (id) {
      const { error } = await client.from('profile').upsert({
        id,
        user_id: uid,
        name: editName,
        icon: iconExists || iconChanged,
      });
      if (error) {
        alert('Failed: Update Profile.');
      }
    } else {
      const { error } = await client.from('profile').insert({
        user_id: uid,
        name: editName,
        icon: iconChanged,
      });
      if (error) {
        alert('Failed: Save Profile.');
      }
    }
    getUserInfo();
    closeModal();
  }, [closeModal, editName, getUserInfo, iconExists, id, previewIconFile, uid]);

  const handleChangePreviewIcon = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    setPreviewIconFile(e.target.files[0]);
    setPreviewIcon(URL.createObjectURL(e.target.files[0]));
    e.currentTarget.value = '';
  }, []);

  const handleClickChangeIcon = useCallback(() => {
    iconInputRef?.current?.click();
  }, []);

  return (
    <>
      <div className='border-2 rounded-full  border-gray-300 px-4 py-1 cursor-pointer flex gap-2' onClick={openModal}>
        <Avatar
          size='36'
          name={name}
          color='#bbbbbb'
          alt='Icon'
          round
          src={icon ?? ''}
        />
        <a className='text-xl pt-1'>{name}</a>
      </div>
      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as='div' className='fixed inset-0 z-10 overflow-y-auto' onClose={closeModal}>
          <div className='min-h-screen px-4 text-center border-2'>
            <span className='inline-block h-screen align-middle' aria-hidden='true'>&#8203</span>
            <Transition.Child
              as={Fragment}
              enter='ease-out duration-300'
              enterFrom='opacity-0 scale-95'
              enterTo='opacity-100 scale-100'
              leave='ease-in duration-200'
              leaveFrom='opacity-100 scale-100'
              leaveTo='opacity-0 scale-95'
            >
              <div className='inline-block  w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform border  border-gray-300 shadow-xl bg-gray-50 rounded-xl'>
                <Dialog.Title as='h3' className='text-2xl font-medium leading-6 text-center text-gray-900'>
                  Edit Profile
                </Dialog.Title>
                <div className='my-4'>
                  <input className='hidden' type='file' accept='image/jpeg' ref={iconInputRef} onChange={handleChangePreviewIcon}/>
                  <div className='flex justify-center mt-2'>
                    <Avatar
                      className='cursor-pointer'
                      size='72'
                      name={editName}
                      color='#bbbbbb'
                      alt='Icon'
                      round
                      src={previewIcon ?? ''}
                      onClick={handleClickChangeIcon}
                    />
                  </div>
                </div>
                <div className='grid grid-cols-4 gap-2 mt-4'>
                  <div className='col-span-1 text-xl text-center'>Name</div>
                  <input className='w-full h-10 col-span-3 p-2 bg-white border border-gray-300 rounded shadow appearance-none hover:border-gray-700' value={editName} onChange={(e) => setEditName(e.target.value)}/>
                </div>
                <div className='flex justify-center mt-4'>
                  <div className='w-32 p-2'>
                    <Button block type='default' size='large' icon={<IconX />} onClick={() => {
                      getUserInfo();
                      closeModal();
                    }}>Cancel</Button>
                  </div>
                  <div className='w-32 p-2'>
                    <Button block size='large' icon={<IconSave />} onClick={handleSave}>
                      Save
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
