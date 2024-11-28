import { BaseProps } from '../@types/common';
import useModel from '../hooks/useModel';
import { Popover, Transition } from '@headlessui/react';
import { Fragment } from 'react/jsx-runtime';
import { useMemo } from 'react';
import { PiCaretDown, PiCheck } from 'react-icons/pi';
import { ModelActivate } from '../@types/bot';

interface Props extends BaseProps {
  modelActivate: ModelActivate;
  botId?: string | null;
}

const SwitchBedrockModel: React.FC<Props> = (props) => {
  const { availableModels: allModels, modelId, setModelId } = useModel(props.botId, props.modelActivate);

  const availableModels = useMemo(() => {
    return allModels.filter(model => {
      if (props.modelActivate) {
        return props.modelActivate[model.modelId] === true;
      }
      return true;
    });
  }, [allModels, props.modelActivate]);

  const modelName = useMemo(() => {
    return availableModels.find((model) => model.modelId === modelId)?.label ?? '';
  }, [availableModels, modelId]);


  return (
    <div className="">
      <Popover className="relative">
        {() => (
          <>
            <Popover.Button
              className={`${
                props.className ?? ''
              } group inline-flex w-auto whitespace-nowrap rounded border-aws-squid-ink/50 bg-aws-paper p-2 px-3 text-base hover:brightness-75`}>
              <div className="flex items-center justify-between text-xl font-bold text-dark-gray">
                <span>{modelName}</span>
                <PiCaretDown className="ml-2" />
              </div>
            </Popover.Button>
            <Transition
              as={Fragment}
              enter="transition ease-out duration-200"
              enterFrom="opacity-0 translate-y-1"
              enterTo="opacity-100 translate-y-0"
              leave="transition ease-in duration-150"
              leaveFrom="opacity-100 translate-y-0"
              leaveTo="opacity-0 translate-y-1">
              <Popover.Panel className="absolute left-0 top-14 z-10 w-96">
                <div className="mt-0.5 overflow-hidden shadow-lg">
                  <div className="flex flex-col whitespace-nowrap rounded border border-aws-font-color/50 bg-white text-sm">
                    {availableModels.map((model) => (
                      <div
                        key={model.modelId}
                        className="m-1 flex cursor-pointer rounded p-1 px-2 hover:bg-light-gray"
                        onClick={() => {
                          setModelId(model.modelId);
                        }}>
                        <div className="mr-3 flex flex-col items-center justify-center">
                          <PiCheck
                            className={
                              model.modelId === modelId
                                ? ''
                                : 'text-transparent'
                            }
                          />
                        </div>
                        <div>
                          <div className="block text-left font-semibold">
                            <span>{model.label}</span>
                          </div>
                          {model.description && (
                            <div className="block whitespace-normal text-left text-xs text-dark-gray">
                              <span>{model.description}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </Popover.Panel>
            </Transition>
          </>
        )}
      </Popover>
    </div>
  );
};

export default SwitchBedrockModel;
