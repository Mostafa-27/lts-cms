import React, { useState, useEffect } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { toast } from 'sonner';
import { Mail, Save } from 'lucide-react';
import { emailSettingsService } from '../../../../services/api';
import { Button } from '../../../ui/button';
import { Card } from '../../../ui/card';
import { Input } from '../../../ui/input';
import { Label } from '../../../ui/label';

interface EmailSettingsFormData {
  defaultEmail: string;
}

const EmailSettings: React.FC = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors }
  } = useForm<EmailSettingsFormData>();

  useEffect(() => {
    const loadSettings = async () => {
      setIsLoading(true);
      try {
        const response = await emailSettingsService.getDefaultEmail();
        if (response.success && response.data) {
          setValue('defaultEmail', response.data.defaultEmail);
        }
      } catch (error) {
        console.error('Failed to load email settings:', error);
        toast.error('Failed to load email settings');
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, [setValue]);

  const onSubmit: SubmitHandler<EmailSettingsFormData> = async (data) => {
    setIsLoading(true);
    try {
      const response = await emailSettingsService.updateDefaultEmail(data.defaultEmail);
      if (response.success) {
        toast.success('Email settings updated successfully');
      } else {
        toast.error('Failed to update email settings');
      }
    } catch (error) {
      console.error('Failed to update email settings:', error);
      toast.error('Failed to update email settings');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="p-6 bg-white dark:bg-gray-800 shadow-sm">
      {/* <div className="mb-6">
        <h3 className="text-lg font-medium mb-2 text-gray-800 dark:text-gray-100">Default Email Configuration</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Set the default email address that will receive notifications from the application.
        </p>
      </div> */}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="defaultEmail" className="text-sm font-medium">
            Default Email Address
          </Label>
          <div className="flex gap-2">
            <div className="relative flex-grow">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
              <Input
                id="defaultEmail"
                type="email"
                placeholder="email@example.com"
                className="pl-9"
                {...register("defaultEmail", { 
                  required: "Email is required",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Invalid email address"
                  }
                })}
                disabled={isLoading}
              />
            </div>
          </div>
          {errors.defaultEmail && (
            <p className="text-sm text-red-500">{errors.defaultEmail.message}</p>
          )}
        </div>

        <div className="pt-2">
          <Button 
            type="submit" 
            disabled={isLoading}
            className="gap-2"
          >
            <Save className="h-4 w-4" />
            {isLoading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default EmailSettings;
