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
  defaultCvEmail: string;
  defaultUserDataEmail: string;
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
        const [cvRes, userDataRes] = await Promise.all([
          emailSettingsService.getDefaultCvEmail(),
          emailSettingsService.getDefaultUserDataEmail()
        ]);
        if (cvRes && cvRes.data) {
          setValue('defaultCvEmail', cvRes.data.value || cvRes.data.defaultCvEmail || '');
        }
        if (userDataRes && userDataRes.data) {
          setValue('defaultUserDataEmail', userDataRes.data.value || userDataRes.data.defaultUserDataEmail || '');
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
      const [cvRes, userDataRes] = await Promise.all([
        emailSettingsService.updateDefaultCvEmail(data.defaultCvEmail),
        emailSettingsService.updateDefaultUserDataEmail(data.defaultUserDataEmail)
      ]);
      if ((cvRes && cvRes.success) && (userDataRes && userDataRes.success)) {
        toast.success('Email settings updated successfully');
      } else {
        toast.error('Failed to update one or more email settings');
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
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="defaultCvEmail" className="text-sm font-medium">
            Default CV Email Address
          </Label>
          <div className="flex gap-2">
            <div className="relative flex-grow">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
              <Input
                id="defaultCvEmail"
                type="email"
                placeholder="cv@email.com"
                className="pl-9"
                {...register("defaultCvEmail", {
                  required: "CV Email is required",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Invalid email address"
                  }
                })}
                disabled={isLoading}
              />
            </div>
          </div>
          {errors.defaultCvEmail && (
            <p className="text-sm text-red-500">{errors.defaultCvEmail.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="defaultUserDataEmail" className="text-sm font-medium">
            Default User Data Email Address
          </Label>
          <div className="flex gap-2">
            <div className="relative flex-grow">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
              <Input
                id="defaultUserDataEmail"
                type="email"
                placeholder="user@data.com"
                className="pl-9"
                {...register("defaultUserDataEmail", {
                  required: "User Data Email is required",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Invalid email address"
                  }
                })}
                disabled={isLoading}
              />
            </div>
          </div>
          {errors.defaultUserDataEmail && (
            <p className="text-sm text-red-500">{errors.defaultUserDataEmail.message}</p>
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
