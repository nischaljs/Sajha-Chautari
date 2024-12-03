import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { User } from '@/types/User';
import api from "@/utils/axiosInterceptor";
import { avatarsBaseUrl } from '@/utils/Links';
import { Loader2 } from "lucide-react";
import { useEffect, useState } from 'react';
import { useForm } from "react-hook-form";

const ProfileEditor = ({ user, onProfileUpdate }:{user:User, onProfileUpdate: (arg0: User)=> void}) => {
  const [open, setOpen] = useState(false);
  const [avatars, setAvatars] = useState([]);
  const [loading, setLoading] = useState(false);

  const form = useForm({
    defaultValues: {
      email: user?.email || '',
      nickname: user?.nickname || '',
      avatarId: user?.avatarId || ''
    }
  });

  useEffect(() => {
    fetchAvatars();
  }, []);

  const fetchAvatars = async () => {
    try {
      const response = await api.get('/user/avatars');
      if (response?.data?.success) {
        setAvatars(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch avatars:', error);
    }
  };

  const onSubmit = async (data :any) => {
    setLoading(true);
    try {
      const response = await api.put('/user/profile', {
        nickname: data.nickname,
        avatarId: data.avatarId
      });
      
      if (response?.data?.success) {
        onProfileUpdate(response.data.data);
        setOpen(false);
      }
    } catch (error) {
      console.error('Failed to update profile:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <TooltipProvider>
      <Tooltip open={!user?.nickname}>
        <TooltipTrigger asChild>
          <Button 
            size="lg" 
            onClick={() => setOpen(true)}
          >
            Edit Profile
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Please set up your profile first!</p>
        </TooltipContent>
      </Tooltip>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input {...field} disabled />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="nickname"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nickname</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter your nickname" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="avatarId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Select Avatar</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        value={field.value}
                        className="grid grid-cols-4 gap-4"
                      >
                        {avatars.map((avatar:any) => (
                          <div key={avatar.id} className="text-center">
                            <RadioGroupItem
                              value={avatar.id}
                              id={avatar.id}
                              className="sr-only"
                            />
                            <label
                              htmlFor={avatar.id}
                              className="cursor-pointer space-y-2"
                            >
                              <img
                                src={ avatarsBaseUrl+avatar.imageUrl || '/placeholder-avatar.png'}
                                alt={avatar.name || 'Avatar'}
                                className={`w-12 h-12 rounded-full mx-auto transition-all ${
                                  field.value === avatar.id
                                    ? 'ring-2 ring-primary'
                                    : ''
                                }`}
                              />
                              <p className="text-xs">{avatar.name}</p>
                            </label>
                          </div>
                        ))}
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Update Profile'
                )}
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  );
};

export default ProfileEditor;