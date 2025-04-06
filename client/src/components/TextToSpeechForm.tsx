import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { ttsRequestSchema } from "@shared/schema";
import type { Voice } from "@shared/schema";

const formSchema = ttsRequestSchema.extend({
  text: z.string().min(1, "Text is required").max(5000, "Text cannot exceed 5000 characters"),
});

type TextToSpeechFormProps = {
  voices: Voice[];
  selectedVoice: string;
  onVoiceChange: (voiceId: string) => void;
  onGenerationComplete: (data: {
    audio: string;
    format: string;
    text: string;
    voiceId: string;
  }) => void;
  apiConnected: boolean;
};

export default function TextToSpeechForm({
  voices,
  selectedVoice,
  onVoiceChange,
  onGenerationComplete,
  apiConnected,
}: TextToSpeechFormProps) {
  const { toast } = useToast();
  const [charCount, setCharCount] = useState(0);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      text: "",
      voiceId: selectedVoice,
      stability: 50,
      clarity: 70,
    },
  });

  // Update the form's voiceId when selectedVoice changes
  if (form.getValues("voiceId") !== selectedVoice) {
    form.setValue("voiceId", selectedVoice);
  }

  const generateSpeech = useMutation({
    mutationFn: async (data: z.infer<typeof formSchema>) => {
      const res = await apiRequest("POST", "/api/text-to-speech", data);
      return res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Generation Complete",
        description: "Your audio has been successfully generated.",
      });
      
      onGenerationComplete({
        audio: data.audio,
        format: data.format,
        text: form.getValues("text"),
        voiceId: form.getValues("voiceId"),
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "Failed to generate audio. Please try again.",
      });
    },
  });

  function onSubmit(data: z.infer<typeof formSchema>) {
    generateSpeech.mutate(data);
  }

  function updateCharCount(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setCharCount(e.target.value.length);
    form.setValue("text", e.target.value);
  }

  function resetForm() {
    form.reset();
    setCharCount(0);
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h2 className="font-display font-semibold text-lg text-gray-800 mb-4">Text to Voice</h2>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          <FormField
            control={form.control}
            name="text"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Enter your text</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Textarea
                      placeholder="Type or paste the text you want to convert to speech..."
                      className="min-h-[180px] resize-none"
                      {...field}
                      onChange={updateCharCount}
                      maxLength={5000}
                    />
                    <div className="absolute right-2 bottom-2 text-xs text-gray-500">
                      {charCount}/5000 characters
                    </div>
                  </div>
                </FormControl>
              </FormItem>
            )}
          />
          
          <div className="flex flex-col sm:flex-row gap-4">
            <FormField
              control={form.control}
              name="voiceId"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>Voice</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value);
                      onVoiceChange(value);
                    }}
                    value={field.value}
                    disabled={voices.length === 0}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a voice" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {voices.map((voice) => (
                        <SelectItem key={voice.id} value={voice.id}>
                          {voice.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="stability"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>Stability {field.value}%</FormLabel>
                  <FormControl>
                    <Slider
                      min={0}
                      max={100}
                      step={5}
                      className="pt-2"
                      onValueChange={(value) => field.onChange(value[0])}
                      defaultValue={[field.value]}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="clarity"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>Clarity {field.value}%</FormLabel>
                  <FormControl>
                    <Slider
                      min={0}
                      max={100}
                      step={5}
                      className="pt-2"
                      onValueChange={(value) => field.onChange(value[0])}
                      defaultValue={[field.value]}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-between items-center">
            <div className="text-sm text-gray-500">
              {apiConnected ? (
                <span>
                  <i className="ri-check-line text-green-500"></i> API Connected
                </span>
              ) : (
                <span>
                  <i className="ri-error-warning-line text-yellow-500"></i> API Connection Issue
                </span>
              )}
            </div>
            
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={resetForm}
              >
                Reset
              </Button>
              <Button
                type="submit"
                disabled={generateSpeech.isPending || !form.getValues("text") || !apiConnected}
                className="flex items-center gap-2"
              >
                <i className="ri-soundwave-line"></i>
                {generateSpeech.isPending ? "Generating..." : "Generate"}
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
