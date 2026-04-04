package com.loanmaker.config;

import com.loanmaker.infrastructure.ai.AiServiceProperties;
import com.loanmaker.infrastructure.ai.RagProperties;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.client.RestTemplate;

@Configuration
@EnableConfigurationProperties({AiServiceProperties.class, RagProperties.class})
public class AppConfig {

    @Bean
    public RestTemplate restTemplate(AiServiceProperties aiServiceProperties) {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(aiServiceProperties.timeoutMs());
        factory.setReadTimeout(aiServiceProperties.timeoutMs());
        return new RestTemplate(factory);
    }
}
